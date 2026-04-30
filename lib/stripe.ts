import Stripe from "stripe";
import { env } from "@/lib/env";

let cached: Stripe | null = null;

export function stripe(): Stripe {
  if (cached) return cached;
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  // Use the SDK's pinned default API version. Avoid hardcoding so the
  // installed @types/stripe stays the source of truth.
  cached = new Stripe(env.STRIPE_SECRET_KEY, { typescript: true });
  return cached;
}

export function isStripeConfigured(): boolean {
  return !!env.STRIPE_SECRET_KEY && !!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}
