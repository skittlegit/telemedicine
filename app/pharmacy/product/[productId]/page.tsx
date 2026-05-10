import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { PharmacyListing } from "@/lib/models/PharmacyListing";
import { PharmacyProfile } from "@/lib/models/PharmacyProfile";
import { User } from "@/lib/models/User";
import {
  MarketingHeader,
  MarketingFooter,
} from "@/app/_components/MarketingChrome";
import { marketingHeaderProps } from "@/app/_components/marketingHeaderProps";
import { CATEGORY_LABEL, type Category } from "../../_components/Marketplace";

export const dynamic = "force-dynamic";

type ListingRow = {
  _id: string;
  pharmacy: string;
  name: string;
  generic: string;
  category: Category;
  priceCents: number;
  stock: number;
  createdAt: Date;
};

type ProfileRow = {
  _id: string;
  pharmacyName: string;
  city: string;
  region: string;
  addressLine1: string;
  phone: string;
  licenseVerifiedAt: Date | null;
  user: { _id: string; name: string } | null;
};

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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  await connectDB();
  void User;

  const listing = await PharmacyListing.findById(productId).lean<ListingRow>();
  if (!listing || !listing.stock) notFound();

  const profile = await PharmacyProfile.findOne({ user: listing.pharmacy })
    .populate("user", "name status")
    .lean<ProfileRow>();

  const price = Math.round(listing.priceCents / 100);
  const rxRequired = listing.category === "rx";
  const hue = hashHue(String(listing._id));
  const tileBg = `oklch(0.93 0.04 ${hue})`;
  const tileText = `oklch(0.42 0.12 ${hue})`;
  const pharmacyId = String(listing.pharmacy);

  const headerProps = await marketingHeaderProps();

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader {...headerProps} />

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10">
        <div className="masthead">
          <span>Product</span>
          <span className="meta">
            {CATEGORY_LABEL[listing.category]}
            {rxRequired && " · Prescription required"}
          </span>
        </div>
      </section>

      {/* Product header */}
      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10 pb-8 border-b border-[color:var(--rule)] grid grid-cols-12 gap-x-8 gap-y-6">
        {/* Monogram tile */}
        <div className="col-span-12 sm:col-span-4 md:col-span-3">
          <div
            className="relative aspect-square w-full flex items-center justify-center border border-[color:var(--rule-strong)]"
            style={{ background: tileBg }}
          >
            <span
              className="font-display text-[clamp(3rem,8vw,5rem)] tracking-tight"
              style={{ color: tileText }}
            >
              {listing.name.slice(0, 2)}
            </span>
            {rxRequired && (
              <span
                title="Prescription required"
                className="absolute top-3 right-3 mono text-[11px] tracking-[0.06em] bg-ink text-paper w-7 h-7 flex items-center justify-center"
              >
                Rx
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="col-span-12 sm:col-span-8 md:col-span-6">
          <p className="eyebrow">{CATEGORY_LABEL[listing.category]}</p>
          <h1 className="serif-display mt-3 text-[clamp(1.8rem,4vw,3rem)]">
            {listing.name}
          </h1>
          {listing.generic && listing.generic !== listing.name && (
            <p className="mt-2 text-[14px] text-ink-soft">
              Generic: {listing.generic}
            </p>
          )}

          {rxRequired && (
            <div className="mt-4 alert-band max-w-[46ch]" data-tone="amber">
              <span>
                <strong>Prescription required.</strong> A valid Vellum prescription is needed at checkout. You can obtain one after a consultation with a clinician.
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-4 mt-5">
            <span className="mono tabular text-[clamp(1.4rem,3vw,2rem)] text-ink font-semibold">
              ₹{price.toLocaleString("en-IN")}
            </span>
            <span className="mono text-[12px] text-ink-mute">
              {listing.stock} in stock
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="col-span-12 md:col-span-3 flex flex-col gap-3">
          <Link href="/pharmacy" className="btn btn-clay w-full justify-center text-center">
            Add to basket →
          </Link>
          {profile && (
            <Link
              href={`/pharmacy/${pharmacyId}`}
              className="btn w-full justify-center text-center border-[color:var(--rule)] text-ink-soft hover:border-ink hover:text-ink"
            >
              View pharmacy →
            </Link>
          )}
          <Link href="/pharmacy" className="btn-link text-center text-[12px] text-ink-mute">
            ← Back to marketplace
          </Link>
        </div>
      </section>

      {/* Pharmacy info */}
      {profile && (
        <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-8 border-b border-[color:var(--rule)]">
          <h2 className="font-display text-[15px] tracking-[-0.01em] mb-4">
            Sold by
          </h2>
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 shrink-0 flex items-center justify-center border border-[color:var(--rule)]"
              style={{ background: `oklch(0.93 0.04 ${hashHue(pharmacyId)})` }}
            >
              <span
                className="font-display text-[1.1rem] tracking-tight"
                style={{ color: `oklch(0.42 0.12 ${hashHue(pharmacyId)})` }}
              >
                {initials(profile.pharmacyName)}
              </span>
            </div>
            <div>
              <Link
                href={`/pharmacy/${pharmacyId}`}
                className="text-[14px] font-medium text-ink hover:text-clay transition-colors"
              >
                {profile.pharmacyName}
              </Link>
              <p className="text-[12.5px] text-ink-soft mt-0.5">
                {profile.addressLine1}
                {profile.city ? `, ${profile.city}` : ""}
                {profile.region ? ` ${profile.region}` : ""}
              </p>
              {profile.phone && (
                <p className="mono text-[12px] text-ink-mute mt-0.5">
                  {profile.phone}
                </p>
              )}
              {profile.licenseVerifiedAt && (
                <span className="stamp mt-2 inline-block" data-tone="moss">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}
