import Link from "next/link";
import { requireRole } from "@/lib/authz";
import { paymentsEnabled } from "@/lib/settings";
import { isStripeConfigured } from "@/lib/stripe";
import { setPaymentsEnabledAction } from "@/app/actions/admin";
import { PageHeader, Section } from "@/app/dashboard/_components/Shell";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireRole("admin");
  const stripeOk = isStripeConfigured();
  const enabled = stripeOk ? await paymentsEnabled() : false;

  return (
    <>
      <Link
        href="/dashboard/admin"
        className="eyebrow text-ink-mute hover:text-clay"
      >
        ← Admin
      </Link>
      <PageHeader eyebrow="Admin" title="Platform" italic="settings.">
        Global toggles that affect every patient and clinician on the platform.
      </PageHeader>

      <Section eyebrow="Money" title="Payments">
        <div className="border border-[color:var(--rule-strong)] bg-paper p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-[58ch]">
              <p className="font-medium text-[15px]">
                Stripe Checkout for bookings & pharmacy orders
              </p>
              <p className="text-ink-soft text-[13.5px] leading-[1.65] mt-2">
                When <strong>enabled</strong>, patients are redirected to Stripe
                Checkout to pay the consultation fee or pharmacy fulfilment fee
                before the booking or order is confirmed. When{" "}
                <strong>disabled</strong>, both flows confirm directly without
                collecting payment — useful for demos, internal use, or clinics
                that collect payment offline.
              </p>
              {!stripeOk && (
                <p className="mono text-[11px] text-amber mt-3">
                  Stripe is not configured (missing STRIPE_SECRET_KEY or
                  publishable key). Payments are forced off until configured.
                </p>
              )}
              <p className="mono text-[11px] text-ink-mute mt-3">
                Current state:{" "}
                <span
                  className={enabled ? "text-moss" : "text-amber"}
                >
                  {enabled ? "ENABLED — collecting payment" : "DISABLED — direct confirm"}
                </span>
              </p>
            </div>
            {stripeOk && (
              <form action={setPaymentsEnabledAction} className="shrink-0">
                <input
                  type="hidden"
                  name="enabled"
                  value={enabled ? "0" : "1"}
                />
                <button type="submit" className="btn btn-clay">
                  {enabled ? "Disable payments" : "Enable payments"}
                </button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
