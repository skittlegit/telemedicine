"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/app/actions/auth";

const DOCTORS = [
  { email: "doc.gp@vellum.test", label: "Arjun Sharma — General practice" },
  { email: "doc.cardio@vellum.test", label: "Ananya Krishnan — Cardiology" },
  { email: "doc.derm@vellum.test", label: "Rohan Verma — Dermatology" },
  { email: "doc.neuro@vellum.test", label: "Vikram Nair — Neurology" },
  { email: "doc.ortho@vellum.test", label: "Meera Patel — Orthopaedics" },
  { email: "doc.peds@vellum.test", label: "Sanjay Iyer — Paediatrics" },
  { email: "doc.psych@vellum.test", label: "Priya Nambiar — Psychiatry" },
];

const PHARMACIES = [
  { email: "rx-1@vellum.test", label: "Apollo Medicals — Mumbai" },
  { email: "rx-2@vellum.test", label: "MedPlus Pharmacy — Bengaluru" },
  { email: "rx-3@vellum.test", label: "Wellness Forever — New Delhi" },
  { email: "rx-4@vellum.test", label: "Netmeds Store — Chennai" },
  { email: "rx-5@vellum.test", label: "Medlink Pharmacy — Hyderabad" },
];

export function DemoQuickLogin() {
  const [doctorEmail, setDoctorEmail] = useState(DOCTORS[0].email);
  const [pharmacyEmail, setPharmacyEmail] = useState(PHARMACIES[0].email);

  return (
    <div className="mt-10 border-t border-[color:var(--rule)] pt-6">
      <p className="eyebrow text-ink-mute mb-1">Quick access</p>
      <p className="text-[12px] text-ink-faint mb-5 leading-[1.6]">
        Pre-seeded demo accounts — one click to sign in.
      </p>
      <div className="space-y-2.5">
        {/* Patient */}
        <QuickRow label="Patient" email="patient@vellum.test" password="password123" />

        {/* Doctor — dropdown */}
        <SelectRow
          label="Doctor"
          options={DOCTORS}
          selected={doctorEmail}
          onSelect={setDoctorEmail}
          password="password123"
        />

        {/* Pharmacist — dropdown */}
        <SelectRow
          label="Pharmacist"
          options={PHARMACIES}
          selected={pharmacyEmail}
          onSelect={setPharmacyEmail}
          password="password123"
        />

        {/* Admin */}
        <QuickRow label="Admin" email="admin@vellum.health" password="admin123" />
      </div>
    </div>
  );
}

function QuickRow({
  label,
  email,
  password,
}: {
  label: string;
  email: string;
  password: string;
}) {
  const [, action] = useActionState(loginAction, {});
  return (
    <form
      action={action}
      className="flex items-center gap-3 py-2 border-b border-[color:var(--rule)]">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="password" value={password} />
      <input type="hidden" name="callbackUrl" value="/dashboard" />
      <span className="eyebrow text-clay w-[72px] shrink-0 text-[10px]">{label}</span>
      <span className="mono text-[11px] text-ink-mute flex-1 truncate">{email}</span>
      <button
        type="submit"
        className="btn btn-clay shrink-0 py-1 px-3 text-[11.5px]"
      >
        Sign in →
      </button>
    </form>
  );
}

function SelectRow({
  label,
  options,
  selected,
  onSelect,
  password,
}: {
  label: string;
  options: { email: string; label: string }[];
  selected: string;
  onSelect: (v: string) => void;
  password: string;
}) {
  const [, action] = useActionState(loginAction, {});
  return (
    <form
      action={action}
      className="flex items-center gap-3 py-2 border-b border-[color:var(--rule)]"
    >
      <input type="hidden" name="email" value={selected} />
      <input type="hidden" name="password" value={password} />
      <input type="hidden" name="callbackUrl" value="/dashboard" />
      <span className="eyebrow text-clay w-[72px] shrink-0 text-[10px]">{label}</span>
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="field py-1 flex-1 min-w-0 text-[11.5px]"
      >
        {options.map((o) => (
          <option key={o.email} value={o.email}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="btn btn-clay shrink-0 py-1 px-3 text-[11.5px]"
      >
        Sign in →
      </button>
    </form>
  );
}
