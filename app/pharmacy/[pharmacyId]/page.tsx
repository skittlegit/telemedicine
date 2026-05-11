import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { PharmacyProfile } from "@/lib/models/PharmacyProfile";
import { PharmacyListing } from "@/lib/models/PharmacyListing";
import { User } from "@/lib/models/User";
import {
  MarketingHeader,
  MarketingFooter,
} from "@/app/_components/MarketingChrome";
import { marketingHeaderProps } from "@/app/_components/marketingHeaderProps";
import { CATEGORY_LABEL, type Category } from "../_components/Marketplace";

export const dynamic = "force-dynamic";

type ProfileRow = {
  _id: string;
  pharmacyName: string;
  licenseNumber: string;
  licenseRegion: string;
  licenseVerifiedAt: Date | null;
  addressLine1: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  createdAt: Date;
  user: { _id: string; name: string } | null;
};

type ListingRow = {
  _id: string;
  name: string;
  generic: string;
  category: Category;
  priceCents: number;
  stock: number;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

function hashHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

export default async function PharmacyDetailPage({
  params,
}: {
  params: Promise<{ pharmacyId: string }>;
}) {
  const { pharmacyId } = await params;
  await connectDB();
  void User;

  const profile = await PharmacyProfile.findOne({ user: pharmacyId })
    .populate("user", "name status")
    .lean<ProfileRow>();
  if (!profile || !profile.licenseVerifiedAt) notFound();

  const listings = await PharmacyListing.find({
    pharmacy: pharmacyId,
    active: true,
    stock: { $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .lean<ListingRow[]>();

  const headerProps = await marketingHeaderProps();
  const mono = initials(profile.pharmacyName);
  const hue = hashHue(String(profile.user?._id ?? profile.pharmacyName));

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader {...headerProps} />

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10">
        <div className="masthead">
          <span>Pharmacy</span>
          <span className="meta">Verified seller · Vellum network</span>
        </div>
      </section>

      {/* Header */}
      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10 pb-8 border-b border-[color:var(--rule)] grid grid-cols-12 gap-x-8 gap-y-6">
        <div className="col-span-12 md:col-span-2">
          <div
            className="aspect-square flex items-center justify-center border border-[color:var(--rule-strong)]"
            style={{ background: `oklch(0.93 0.04 ${hue})` }}
          >
            <span
              className="font-display text-[clamp(2rem,5vw,3rem)] tracking-tight"
              style={{ color: `oklch(0.42 0.12 ${hue})` }}
            >
              {mono}
            </span>
          </div>
        </div>
        <div className="col-span-12 md:col-span-7">
          <p className="eyebrow">Verified pharmacy</p>
          <h1 className="serif-display mt-3 text-[clamp(1.8rem,4vw,3rem)]">
            {profile.pharmacyName}
          </h1>
          <p className="mt-3 text-[14px] text-ink-soft leading-[1.6]">
            {profile.addressLine1}
            {profile.city ? `, ${profile.city}` : ""}
            {profile.region ? ` ${profile.region}` : ""}
            {profile.postalCode ? ` – ${profile.postalCode}` : ""}
          </p>
          {profile.phone && (
            <p className="mono text-[13px] text-ink-mute mt-1">{profile.phone}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="stamp" data-tone="moss">
              ✓ Licence verified
            </span>
            <span className="mono text-[11px] text-ink-faint">
              {profile.licenseNumber} · {profile.licenseRegion}
            </span>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3 flex flex-col gap-3">
          <Link href="/pharmacy" className="btn btn-clay w-full justify-center text-center">
            ← Back to marketplace
          </Link>
        </div>
      </section>

      {/* Listings */}
      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-[17px] tracking-[-0.01em]">
            Current listings
          </h2>
          <span className="eyebrow text-[10px]">{listings.length} items</span>
        </div>

        {listings.length === 0 ? (
          <div className="border-y border-[color:var(--rule)] py-16 text-center">
            <p className="font-display text-[18px] text-ink">No listings yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
            {listings.map((item) => {
              const price = Math.round(item.priceCents / 100);
              const tileBg = `oklch(0.93 0.04 ${hashHue(String(item._id))})`;
              const tileText = `oklch(0.42 0.12 ${hashHue(String(item._id))})`;
              const rxRequired = item.category === "rx";
              return (
                <article key={String(item._id)} className="flex flex-col">
                  <Link href={`/pharmacy/product/${String(item._id)}`} className="block">
                    <div
                      className="relative aspect-square w-full flex items-center justify-center border border-[color:var(--rule)] hover:border-ink transition-colors"
                      style={{ background: tileBg }}
                    >
                      <span
                        className="font-display text-[clamp(2rem,5vw,3rem)] tracking-tight"
                        style={{ color: tileText }}
                      >
                        {item.name.slice(0, 2)}
                      </span>
                      {rxRequired && (
                        <span
                          className="rx-mark absolute top-2 right-2"
                          title="Prescription required"
                          aria-hidden
                        />
                      )}
                    </div>
                  </Link>
                  <div className="mt-3">
                    <Link
                      href={`/pharmacy/product/${String(item._id)}`}
                      className="text-[14px] text-ink leading-tight font-medium hover:text-clay transition-colors block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[12px] text-ink-mute mt-0.5">
                      {item.generic}
                    </p>
                    <p className="mono text-[10.5px] text-ink-faint mt-0.5 uppercase tracking-[0.1em]">
                      {CATEGORY_LABEL[item.category]}
                    </p>
                    <p className="mono tabular text-[15px] text-ink font-semibold mt-2">
                      ₹{price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}
