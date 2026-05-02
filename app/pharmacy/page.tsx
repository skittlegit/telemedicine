import { MarketingHeader, MarketingFooter } from "@/app/_components/MarketingChrome";
import { marketingHeaderProps } from "@/app/_components/marketingHeaderProps";
import { Marketplace } from "./_components/Marketplace";

export const metadata = {
  title: "Pharmacy marketplace · Vellum Health",
  description:
    "Browse listings from verified, independent pharmacies on the Vellum network.",
};

export default async function PharmacyPage() {
  const headerProps = await marketingHeaderProps();
  return (
    <main className="min-h-screen flex flex-col">
      <MarketingHeader {...headerProps} />
      <Marketplace />
      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}
