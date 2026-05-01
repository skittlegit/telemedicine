"use client";

import { useActionState, useState } from "react";
import {
  createPharmacyOrderAction,
  type PharmacyFormState,
} from "@/app/actions/pharmacy";

const initial: PharmacyFormState = {};

export interface PharmacyChoice {
  id: string;
  name: string;
  city: string;
  region: string;
  eta: string;
}

export function OrderForm({
  prescriptionId,
  pharmacies,
}: {
  prescriptionId: string;
  pharmacies: PharmacyChoice[];
}) {
  const [state, action, pending] = useActionState(createPharmacyOrderAction, initial);
  const [pharmacyId, setPharmacyId] = useState<string>(pharmacies[0]?.id ?? "");

  if (pharmacies.length === 0) {
    return (
      <div className="mt-10 border border-[color:var(--rule-strong)] bg-paper-tint p-5 text-[14px] text-ink-soft leading-[1.6]">
        No verified pharmacies are available right now. Please try again later
        or contact support.
      </div>
    );
  }

  return (
    <form action={action} className="mt-10 space-y-7">
      <input type="hidden" name="prescriptionId" value={prescriptionId} />
      <input type="hidden" name="pharmacyId" value={pharmacyId} />

      <section>
        <p className="eyebrow mb-3">1 · Choose a pharmacy</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {pharmacies.map((p) => {
            const active = p.id === pharmacyId;
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => setPharmacyId(p.id)}
                aria-pressed={active}
                className={`text-left p-4 border transition-colors ${
                  active
                    ? "border-clay bg-clay-wash"
                    : "border-[color:var(--rule-strong)] hover:border-clay"
                }`}
              >
                <p className="text-[14px] font-semibold tracking-[-0.01em]">
                  {p.name}
                </p>
                <p className="text-[12.5px] text-ink-mute mt-1">
                  {p.city}, {p.region}
                </p>
                <p className="eyebrow text-[10px] mt-2">
                  Est. delivery {p.eta}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="eyebrow mb-3">2 · Delivery address</p>
        <div className="space-y-3">
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
        </div>
        <p className="text-xs text-ink-mute mt-3">
          Address is encrypted at rest. Only the chosen pharmacy can decrypt it.
        </p>
      </section>

      {state.error && (
        <p
          role="alert"
          className="text-sm text-oxblood border border-oxblood/30 bg-clay-wash px-3 py-2"
        >
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-clay w-full justify-center">
        {pending ? "Submitting…" : "Place order →"}
      </button>
    </form>
  );
}
