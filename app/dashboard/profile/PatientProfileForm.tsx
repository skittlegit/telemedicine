"use client";

import { useActionState } from "react";
import {
  updatePatientProfileAction,
  type ProfileFormState,
} from "@/app/actions/profile";

export interface PatientFormInitial {
  dob: string;
  sex: "male" | "female" | "other" | "unspecified";
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  allergies: string;
  conditions: string;
  medications: string;
  insurance: string;
  emergencyContact: string;
}

const INITIAL: ProfileFormState = {};

export function PatientProfileForm({ initial }: { initial: PatientFormInitial }) {
  const [state, action, pending] = useActionState(
    updatePatientProfileAction,
    INITIAL,
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field
          label="Date of birth"
          name="dob"
          type="date"
          defaultValue={initial.dob}
          errors={fe.dob}
        />
        <div>
          <label className="eyebrow block mb-1.5" htmlFor="sex">
            Sex
          </label>
          <select
            id="sex"
            name="sex"
            defaultValue={initial.sex}
            className="field"
          >
            <option value="unspecified">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
        <Field
          label="Phone"
          name="phone"
          type="tel"
          defaultValue={initial.phone}
          placeholder="+1 555 0100"
          errors={fe.phone}
        />
      </div>

      <fieldset className="space-y-4 pt-2">
        <legend className="eyebrow mb-2">Address</legend>
        <Field
          label="Street"
          name="addressLine1"
          defaultValue={initial.addressLine1}
          errors={fe.addressLine1}
        />
        <Field
          label="Apt / suite"
          name="addressLine2"
          defaultValue={initial.addressLine2}
          errors={fe.addressLine2}
        />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Field
            label="City"
            name="city"
            defaultValue={initial.city}
            errors={fe.city}
          />
          <Field
            label="Region"
            name="region"
            defaultValue={initial.region}
            errors={fe.region}
          />
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
            hint="ISO-2 code"
            errors={fe.country}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 pt-2">
        <legend className="eyebrow mb-2">Medical history</legend>
        <Textarea
          label="Allergies"
          name="allergies"
          defaultValue={initial.allergies}
          placeholder="e.g. Penicillin (rash), latex"
          errors={fe.allergies}
        />
        <Textarea
          label="Ongoing conditions"
          name="conditions"
          defaultValue={initial.conditions}
          placeholder="e.g. Hypertension, asthma"
          errors={fe.conditions}
        />
        <Textarea
          label="Current medications"
          name="medications"
          defaultValue={initial.medications}
          placeholder="Drug, dose, frequency"
          errors={fe.medications}
        />
      </fieldset>

      <fieldset className="space-y-4 pt-2">
        <legend className="eyebrow mb-2">Other</legend>
        <Textarea
          label="Insurance"
          name="insurance"
          defaultValue={initial.insurance}
          rows={2}
          placeholder="Provider, member ID, group #"
          errors={fe.insurance}
        />
        <Textarea
          label="Emergency contact"
          name="emergencyContact"
          defaultValue={initial.emergencyContact}
          rows={2}
          placeholder="Name, relation, phone"
          errors={fe.emergencyContact}
        />
      </fieldset>

      {state.error && (
        <p role="alert" className="text-oxblood text-sm">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="text-moss text-sm">
          Profile saved.
        </p>
      )}

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-clay disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes →"}
        </button>
        <p className="text-xs text-ink-mute">
          Stored encrypted at rest. Only your clinicians see this.
        </p>
      </div>
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
        className={`field ${mono ? "mono" : ""}`}
        aria-invalid={!!errors?.[0]}
        aria-describedby={
          errors?.[0] ? `${name}-error` : hint ? `${name}-hint` : undefined
        }
      />
      {hint && !errors?.length && (
        <p id={`${name}-hint`} className="text-xs text-ink-mute mt-1">
          {hint}
        </p>
      )}
      {errors?.[0] && (
        <p
          id={`${name}-error`}
          role="alert"
          className="text-oxblood text-xs mt-1"
        >
          {errors[0]}
        </p>
      )}
    </div>
  );
}

function Textarea({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 3,
  errors,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  errors?: string[];
}) {
  return (
    <div>
      <label className="eyebrow block mb-1.5" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="field"
        aria-invalid={!!errors?.[0]}
      />
      {errors?.[0] && (
        <p role="alert" className="text-oxblood text-xs mt-1">
          {errors[0]}
        </p>
      )}
    </div>
  );
}
