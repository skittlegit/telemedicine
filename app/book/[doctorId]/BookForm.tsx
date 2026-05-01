"use client";

import { useActionState, useState } from "react";
import {
  bookAppointmentAction,
  type BookFormState,
} from "@/app/actions/booking";

const initial: BookFormState = {};

export interface SlotDay {
  label: string;
  date: string;
  slots: Array<{ time: string; iso: string; disabled?: boolean }>;
}

export function BookForm({
  doctorId,
  doctorName,
  feeCents,
  days,
}: {
  doctorId: string;
  doctorName: string;
  feeCents: number;
  days: SlotDay[];
}) {
  const [state, action, pending] = useActionState(
    bookAppointmentAction,
    initial,
  );
  const firstEnabled =
    days.flatMap((d) => d.slots).find((s) => !s.disabled)?.iso ?? "";
  const [picked, setPicked] = useState<string>(firstEnabled);

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="doctorId" value={doctorId} />
      <input type="hidden" name="startAt" value={picked} />

      <section>
        <div className="flex items-end justify-between mb-3">
          <p className="eyebrow">Pick a time</p>
          <p className="text-xs text-ink-mute">
            All times local · 30 min slots
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px border border-[color:var(--rule-strong)] bg-[color:var(--rule)]">
          {days.map((day) => (
            <div key={day.date} className="bg-paper p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <p className="text-[14.5px] font-semibold tracking-[-0.012em]">
                  {day.label}
                </p>
                <p className="mono text-[11px] text-ink-mute">{day.date}</p>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {day.slots.map((s) => {
                  const active = picked === s.iso;
                  return (
                    <button
                      key={s.iso}
                      type="button"
                      disabled={s.disabled}
                      onClick={() => setPicked(s.iso)}
                      className={`px-2.5 py-2 border text-[13px] mono transition-colors ${
                        active
                          ? "border-clay bg-clay text-paper"
                          : s.disabled
                            ? "border-[color:var(--rule)] text-ink-faint line-through cursor-not-allowed"
                            : "border-[color:var(--rule-strong)] text-ink hover:border-clay hover:text-clay"
                      }`}
                    >
                      {s.time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!picked && (
          <p className="mt-3 text-xs text-amber">
            Select a slot above to continue.
          </p>
        )}
      </section>

      <section>
        <label className="eyebrow block mb-2" htmlFor="reason">
          Reason for visit
        </label>
        <textarea
          id="reason"
          name="reason"
          required
          rows={5}
          maxLength={2000}
          className="field"
          placeholder="Brief description of symptoms or concerns…"
          aria-describedby="reason-hint"
        />
        <p id="reason-hint" className="text-xs text-ink-mute mt-1.5">
          Stored encrypted. Only Dr. {doctorName} can read it.
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

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[color:var(--rule)]">
        <div>
          <p className="eyebrow text-ink-mute">Total today</p>
          <p className="text-[22px] font-semibold tracking-[-0.018em] leading-none mt-1">
            ${(feeCents / 100).toFixed(2)}
          </p>
        </div>
        <button
          type="submit"
          disabled={pending || !picked}
          className="btn btn-clay disabled:opacity-50"
        >
          {pending ? "Reserving…" : "Confirm booking →"}
        </button>
      </div>
    </form>
  );
}
