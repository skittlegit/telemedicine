"use client";

import { useActionState } from "react";
import {
  updatePharmacyProfileAction,
  type ProfileFormState,
} from "@/app/actions/profile";

interface Initial {
  pharmacyName: string;
  licenseNumber: string;
  licenseRegion: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
}

const INITIAL: ProfileFormState = {};

export function PharmacyProfileForm({ initial }: { initial: Initial }) {
  const [state, action, pending] = useActionState(
    updatePharmacyProfileAction,
    INITIAL,
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      <Field
        label="Pharmacy name"
        name="pharmacyName"
        defaultValue={initial.pharmacyName}
        errors={fe.pharmacyName}
      />

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Licence number"
          name="licenseNumber"
          defaultValue={initial.licenseNumber}
          mono
          errors={fe.licenseNumber}
        />
        <Field
          label="Region"
          name="licenseRegion"
          defaultValue={initial.licenseRegion}
          placeholder="e.g. CA-USA"
          errors={fe.licenseRegion}
        />
      </div>
      <p className="text-xs text-ink-mute -mt-2">
        Changing licence details will reset your verification.
      </p>

      <hr className="rule" />

      <Field
        label="Address line 1"
        name="addressLine1"
        defaultValue={initial.addressLine1}
        errors={fe.addressLine1}
      />
      <Field
        label="Address line 2"
        name="addressLine2"
        defaultValue={initial.addressLine2}
        errors={fe.addressLine2}
      />
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="City"
          name="city"
          defaultValue={initial.city}
          errors={fe.city}
        />
        <Field
          label="State / Region"
          name="region"
          defaultValue={initial.region}
          errors={fe.region}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field
          label="Postal code"
          name="postalCode"
          defaultValue={initial.postalCode}
          mono
          errors={fe.postalCode}
        />
        <Field
          label="Country"
          name="country"
          defaultValue={initial.country}
          placeholder="US"
          mono
          hint="2-letter code"
          errors={fe.country}
        />
        <Field
          label="Phone"
          name="phone"
          defaultValue={initial.phone}
          mono
          errors={fe.phone}
        />
      </div>

      {state.error && (
        <p role="alert" className="text-oxblood text-sm">{state.error}</p>
      )}
      {state.ok && <p role="status" className="text-moss text-sm">Profile saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-clay disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save profile →"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  mono,
  hint,
  errors,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  mono?: boolean;
  hint?: string;
  errors?: string[];
}) {
  return (
    <div>
      <label className="eyebrow block mb-1.5" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`w-full bg-paper-tint border border-[color:var(--rule-strong)] px-3 py-2 text-sm focus:outline-none focus:border-clay ${
          mono ? "mono" : ""
        }`}
        aria-invalid={!!errors?.[0]}
        aria-describedby={
          errors?.[0]
            ? `${name}-error`
            : hint
              ? `${name}-hint`
              : undefined
        }
      />
      {hint && !errors?.length && (
        <p id={`${name}-hint`} className="text-xs text-ink-mute mt-1">{hint}</p>
      )}
      {errors?.[0] && (
        <p id={`${name}-error`} role="alert" className="text-oxblood text-xs mt-1">
          {errors[0]}
        </p>
      )}
    </div>
  );
}
