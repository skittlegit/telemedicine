import { connectDB } from "@/lib/db";
import { PharmacyProfile } from "@/lib/models/PharmacyProfile";
import { PharmacyListing } from "@/lib/models/PharmacyListing";
import { User } from "@/lib/models/User";
import { MarketingHeader, MarketingFooter } from "@/app/_components/MarketingChrome";
import { marketingHeaderProps } from "@/app/_components/marketingHeaderProps";
import {
  Marketplace,
  type Pharmacy,
  type Product,
  type Category,
} from "./_components/Marketplace";

export const metadata = {
  title: "Pharmacy marketplace · Vellum Health",
  description:
    "Browse listings from verified, independent pharmacies on the Vellum network.",
};

export const dynamic = "force-dynamic";

type PharmacyProfileRow = {
  _id: string;
  user: { _id: string; name: string } | null;
  pharmacyName: string;
  city?: string;
  region?: string;
  licenseVerifiedAt?: Date | null;
  createdAt: Date;
};

type ListingRow = {
  _id: string;
  pharmacy: string;
  name: string;
  generic: string;
  category: Category;
  priceCents: number;
  stock: number;
  active: boolean;
  createdAt: Date;
};

/** Stable hue from a string (so monogram colours don't reshuffle on reload). */
function hashHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

function isoMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function PharmacyPage() {
  await connectDB();
  // Touch User so its schema is registered for populate().
  void User;

  const [profileRows, listingRows, headerProps] = await Promise.all([
    PharmacyProfile.find({ licenseVerifiedAt: { $ne: null } })
      .populate("user", "name status")
      .sort({ createdAt: -1 })
      .lean<PharmacyProfileRow[]>(),
    PharmacyListing.find({ active: true, stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .lean<ListingRow[]>(),
    marketingHeaderProps(),
  ]);

  // Map verified pharmacies → UI shape. ID is the user id (which is also
  // the foreign key on PharmacyOrder + PharmacyListing).
  const pharmacies: Pharmacy[] = profileRows
    .filter((p): p is PharmacyProfileRow & { user: { _id: string; name: string } } => !!p.user)
    .map((p) => ({
      id: String(p.user._id),
      name: p.pharmacyName,
      monogram: initials(p.pharmacyName),
      city: p.city ?? "",
      state: p.region ?? "",
      rating: 4.7,
      reviewCount: 0,
      deliveryHours: "01:30",
      joined: isoMonth(p.createdAt),
      verified: !!p.licenseVerifiedAt,
      coldChain: true,
      fulfilled: 0,
      tagline: "Verified pharmacy on the Vellum network.",
    }));

  // Drop listings whose pharmacy isn't in the verified set.
  const validIds = new Set(pharmacies.map((p) => p.id));
  const products: Product[] = listingRows
    .filter((l) => validIds.has(String(l.pharmacy)))
    .map((l) => {
      const price = Math.round(l.priceCents / 100);
      return {
        id: String(l._id),
        name: l.name,
        generic: l.generic || l.name,
        strength: "",
        pack: "",
        category: l.category,
        price,
        mrp: price,
        monogramHue: hashHue(String(l._id)),
        tag: null,
        rxRequired: l.category === "rx",
        inStock: l.stock > 0,
        rating: 4.7,
        pharmacyId: String(l.pharmacy),
      };
    });

  return (
    <main className="min-h-screen flex flex-col">
      <MarketingHeader {...headerProps} />
      <Marketplace
        authed={headerProps.authed}
        pharmacies={pharmacies}
        products={products}
      />
      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}
