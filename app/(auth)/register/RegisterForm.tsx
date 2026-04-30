"use client";

import { useActionState, useState } from "react";
import { registerAction, type FormState } from "@/app/actions/auth";

const initial: FormState = {};

export function RegisterForm({ defaultRole }: { defaultRole: string }) {
  const [state, action, pending] = useActionState(registerAction, initial);
  const [role, setRole] = useState(defaultRole);
  const isDoctor = role === "doctor";
  const isPharmacist = role === "pharmacist";
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
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="field"
        >
          <option value="patient">A patient</option>
          <option value="doctor">A clinician (pending licensure review)</option>
          <option value="pharmacist">A pharmacist (pending review)</option>
        </select>
      </div>

      {isDoctor && (
        <div className="rise rise-1 border border-[color:var(--rule-strong)] bg-paper-tint p-5 space-y-4">
          <p className="eyebrow text-clay">Clinician licensure</p>
          <div>
            <label className="eyebrow block mb-2" htmlFor="specialty">Specialty</label>
            <input
              id="specialty"
              name="specialty"
              required
              placeholder="e.g. Internal medicine"
              className="field"
            />
            {state.fieldErrors?.specialty && (
              <p className="text-xs text-oxblood mt-1">{state.fieldErrors.specialty[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="eyebrow block mb-2" htmlFor="licenseNumber">Licence number</label>
              <input
                id="licenseNumber"
                name="licenseNumber"
                required
                className="field mono"
              />
              {state.fieldErrors?.licenseNumber && (
                <p className="text-xs text-oxblood mt-1">{state.fieldErrors.licenseNumber[0]}</p>
              )}
            </div>
            <div>
              <label className="eyebrow block mb-2" htmlFor="licenseRegion">Region</label>
              <input
                id="licenseRegion"
                name="licenseRegion"
                required
                placeholder="e.g. CA-USA"
                className="field"
              />
              {state.fieldErrors?.licenseRegion && (
                <p className="text-xs text-oxblood mt-1">{state.fieldErrors.licenseRegion[0]}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-ink-mute">
            An admin will verify your licence before your account is activated.
          </p>
        </div>
      )}

      {isPharmacist && (
        <div className="rise rise-1 border border-[color:var(--rule-strong)] bg-paper-tint p-5 space-y-4">
          <p className="eyebrow text-clay">Pharmacy licensure</p>
          <div>
            <label className="eyebrow block mb-2" htmlFor="pharmacyName">Pharmacy name</label>
            <input
              id="pharmacyName"
              name="pharmacyName"
              required
              placeholder="e.g. Vellum Dispensary — Mission"
              className="field"
            />
            {state.fieldErrors?.pharmacyName && (
              <p className="text-xs text-oxblood mt-1">{state.fieldErrors.pharmacyName[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="eyebrow block mb-2" htmlFor="licenseNumber">NABP / licence #</label>
              <input
                id="licenseNumber"
                name="licenseNumber"
                required
                className="field mono"
              />
              {state.fieldErrors?.licenseNumber && (
                <p className="text-xs text-oxblood mt-1">{state.fieldErrors.licenseNumber[0]}</p>
              )}
            </div>
            <div>
              <label className="eyebrow block mb-2" htmlFor="licenseRegion">Region</label>
              <input
                id="licenseRegion"
                name="licenseRegion"
                required
                placeholder="e.g. CA-USA"
                className="field"
              />
              {state.fieldErrors?.licenseRegion && (
                <p className="text-xs text-oxblood mt-1">{state.fieldErrors.licenseRegion[0]}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-ink-mute">
            An admin will verify your pharmacy before your account is activated.
          </p>
        </div>
      )}

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
