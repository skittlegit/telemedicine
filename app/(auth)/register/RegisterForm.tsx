"use client";

import { useActionState } from "react";
import { registerAction, type FormState } from "@/app/actions/auth";

const initial: FormState = {};

export function RegisterForm({ defaultRole }: { defaultRole: string }) {
  const [state, action, pending] = useActionState(registerAction, initial);
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label className="eyebrow block mb-2" htmlFor="name">Full name</label>
        <input id="name" name="name" required className="field" />
        {state.fieldErrors?.name && (
          <p className="text-xs text-oxblood mt-1">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label className="eyebrow block mb-2" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="field"
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-oxblood mt-1">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div>
        <label className="eyebrow block mb-2" htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="field"
        />
        <p className="text-xs text-ink-mute mt-1">
          Min. 8 characters with at least one letter and number.
        </p>
        {state.fieldErrors?.password && (
          <p className="text-xs text-oxblood mt-1">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      <div>
        <label className="eyebrow block mb-2" htmlFor="role">I am registering as</label>
        <select id="role" name="role" defaultValue={defaultRole} className="field">
          <option value="patient">A patient</option>
          <option value="doctor">A clinician (pending licensure review)</option>
          <option value="pharmacist">A pharmacist (pending review)</option>
        </select>
      </div>

      {state.error && (
        <p className="text-sm text-oxblood border border-oxblood/30 bg-clay-wash px-3 py-2">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-clay w-full justify-center">
        {pending ? "Creating account…" : "Create account →"}
      </button>
    </form>
  );
}
