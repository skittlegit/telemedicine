"use client";

import { useActionState, useState } from "react";
import {
  issuePrescriptionAction,
  type RxFormState,
} from "@/app/actions/prescription";

interface Drug {
  name: string;
  dose: string;
  freq: string;
  days: number;
  notes: string;
}

const blank = (): Drug => ({ name: "", dose: "", freq: "", days: 7, notes: "" });
const initial: RxFormState = {};

export function PrescribeForm({ appointmentId }: { appointmentId: string }) {
  const [drugs, setDrugs] = useState<Drug[]>([blank()]);
  const [state, action, pending] = useActionState(issuePrescriptionAction, initial);

  function update<K extends keyof Drug>(idx: number, key: K, value: Drug[K]) {
    setDrugs((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx]!, [key]: value };
      return next;
    });
  }

  return (
    <form action={action} className="mt-10 space-y-6">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="drugs" value={JSON.stringify(drugs)} />

      <div>
        <label className="eyebrow block mb-2" htmlFor="diagnosis">Diagnosis</label>
        <textarea
          id="diagnosis"
          name="diagnosis"
          required
          rows={3}
          className="field"
          placeholder="Working diagnosis…"
        />
      </div>

      <div>
        <p className="eyebrow mb-2">Drugs</p>
        <ul className="space-y-3">
          {drugs.map((d, i) => (
            <li key={i} className="border border-[color:var(--rule)] p-3 grid grid-cols-2 gap-3">
              <input
                placeholder="Drug name"
                value={d.name}
                onChange={(e) => update(i, "name", e.target.value)}
                className="field col-span-2"
                required
              />
              <input
                placeholder="Dose (e.g. 500 mg)"
                value={d.dose}
                onChange={(e) => update(i, "dose", e.target.value)}
                className="field"
                required
              />
              <input
                placeholder="Frequency (e.g. 1 × daily)"
                value={d.freq}
                onChange={(e) => update(i, "freq", e.target.value)}
                className="field"
                required
              />
              <input
                type="number"
                min={1}
                max={365}
                placeholder="Days"
                value={d.days}
                onChange={(e) => update(i, "days", Number(e.target.value))}
                className="field"
                required
              />
              <input
                placeholder="Notes (optional)"
                value={d.notes}
                onChange={(e) => update(i, "notes", e.target.value)}
                className="field"
              />
              {drugs.length > 1 && (
                <button
                  type="button"
                  onClick={() => setDrugs((p) => p.filter((_, j) => j !== i))}
                  className="col-span-2 text-xs text-oxblood text-left"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setDrugs((p) => [...p, blank()])}
          className="btn btn-ghost mt-3 text-xs"
        >
          + Add drug
        </button>
      </div>

      {state.error && (
        <p
          role="alert"
          className="text-sm text-oxblood border border-oxblood/30 bg-clay-wash px-3 py-2"
        >
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-clay w-full justify-center">
        {pending ? "Signing & issuing…" : "Sign & issue prescription →"}
      </button>
    </form>
  );
}
