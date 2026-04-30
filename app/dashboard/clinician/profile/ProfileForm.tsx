"use client";

import { useActionState } from "react";
import {
  updateDoctorProfileAction,
  type ProfileFormState,
} from "@/app/actions/profile";

interface Initial {
  specialty: string;
  bio: string;
  licenseNumber: string;
  licenseRegion: string;
  yearsOfExperience: number;
  languages: string;
  consultationFeeCents: number;
}

const INITIAL: ProfileFormState = {};

export function ProfileForm({ initial }: { initial: Initial }) {
  const [state, action, pending] = useActionState(
    updateDoctorProfileAction,
    INITIAL,
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      <Field
        label="Specialty"
        name="specialty"
        defaultValue={initial.specialty}
        placeholder="e.g. Internal medicine"
        errors={fe.specialty}
      />

      <div>
        <label className="eyebrow block mb-1.5" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={initial.bio}
          rows={4}
          maxLength={2000}
          className="w-full bg-paper-tint border border-[color:var(--rule-strong)] px-3 py-2 text-sm focus:outline-none focus:border-clay"
          placeholder="A short, factual bio your patients will see."
        />
        {fe.bio?.[0] && (
          <p className="text-oxblood text-xs mt-1">{fe.bio[0]}</p>
        )}
      </div>

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
        Changing licence details will reset your verification and require a
        fresh admin approval.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Years experience"
          name="yearsOfExperience"
          type="number"
          defaultValue={String(initial.yearsOfExperience)}
          errors={fe.yearsOfExperience}
        />
        <Field
          label="Consultation fee (cents)"
          name="consultationFeeCents"
          type="number"
          defaultValue={String(initial.consultationFeeCents)}
          mono
          hint={`= $${(initial.consultationFeeCents / 100).toFixed(2)}`}
          errors={fe.consultationFeeCents}
        />
      </div>

      <Field
        label="Languages"
        name="languages"
        defaultValue={initial.languages}
        placeholder="English, Spanish, ..."
        hint="Comma-separated."
        errors={fe.languages}
      />

      {state.error && (
        <p className="text-oxblood text-sm">{state.error}</p>
      )}
      {state.ok && (
        <p className="text-moss text-sm">Profile saved.</p>
      )}

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
      />
      {hint && !errors?.length && (
        <p className="text-xs text-ink-mute mt-1">{hint}</p>
      )}
      {errors?.[0] && (
        <p className="text-oxblood text-xs mt-1">{errors[0]}</p>
      )}
    </div>
  );
}
