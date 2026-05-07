import { connectDB } from "@/lib/db";
import { Setting, SETTING_KEYS } from "@/lib/models/Setting";
import { isStripeConfigured } from "@/lib/stripe";

/**
 * Whether the platform should route money flows through Stripe Checkout.
 *
 * Returns false when:
 *   - Stripe is not configured at all (env vars missing), OR
 *   - Admin has explicitly disabled payments via the Setting toggle.
 *
 * When false, booking and pharmacy order flows skip Checkout and confirm
 * the order directly. This is useful for demos and for clinics that
 * collect payment offline.
 */
export async function paymentsEnabled(): Promise<boolean> {
  if (!isStripeConfigured()) return false;
  await connectDB();
  const row = await Setting.findOne({ key: SETTING_KEYS.paymentsEnabled })
    .lean<{ value?: boolean } | null>();
  // Default: enabled when Stripe is configured. Admin must explicitly disable.
  if (!row) return true;
  return row.value !== false;
}

export async function setPaymentsEnabled(
  enabled: boolean,
  actorId?: string,
): Promise<void> {
  await connectDB();
  await Setting.findOneAndUpdate(
    { key: SETTING_KEYS.paymentsEnabled },
    { value: enabled, updatedBy: actorId },
    { upsert: true },
  );
}
