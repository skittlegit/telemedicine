"use client";

import { useActionState } from "react";
import {
  createPharmacyOrderAction,
  type PharmacyFormState,
} from "@/app/actions/pharmacy";

const initial: PharmacyFormState = {};

export function OrderForm({ prescriptionId }: { prescriptionId: string }) {
  const [state, action, pending] = useActionState(createPharmacyOrderAction, initial);
  return (
    <form action={action} className="mt-10 space-y-5">
      <input type="hidden" name="prescriptionId" value={prescriptionId} />
      <p className="eyebrow">Delivery address</p>
      <input name="line1" placeholder="Street address" required className="field" />
      <input name="line2" placeholder="Apartment, suite (optional)" className="field" />
      <div className="grid grid-cols-2 gap-3">
        <input name="city" placeholder="City" required className="field" />
        <input name="region" placeholder="State / Region" required className="field" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input name="postalCode" placeholder="Postal code" required className="field" />
        <input
          name="country"
          placeholder="Country (ISO-2 e.g. US)"
          required
          maxLength={2}
          className="field uppercase"
        />
      </div>

      <p className="text-xs text-ink-mute">
        Address is stored encrypted at rest. The pharmacist who claims your order will be the only
        person able to read it.
      </p>

      {state.error && (
        <p
          role="alert"
          className="text-sm text-oxblood border border-oxblood/30 bg-clay-wash px-3 py-2"
        >
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-clay w-full justify-center">
        {pending ? "Submitting…" : "Pay & queue order →"}
      </button>
    </form>
  );
}
