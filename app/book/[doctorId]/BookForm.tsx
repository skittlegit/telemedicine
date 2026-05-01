"use client";

import { useActionState } from "react";
import { bookAppointmentAction, type BookFormState } from "@/app/actions/booking";

const initial: BookFormState = {};

export function BookForm({
  doctorId,
  defaultStartAt,
}: {
  doctorId: string;
  defaultStartAt: string;
}) {
  const [state, action, pending] = useActionState(bookAppointmentAction, initial);
  return (
    <form action={action} className="mt-10 space-y-6">
      <input type="hidden" name="doctorId" value={doctorId} />

      <div>
        <label className="eyebrow block mb-2" htmlFor="startAt">Start time</label>
        <input
          id="startAt"
          name="startAt"
          type="datetime-local"
          required
          defaultValue={defaultStartAt}
          className="field"
        />
      </div>

      <div>
        <label className="eyebrow block mb-2" htmlFor="reason">Reason for visit</label>
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
        <p id="reason-hint" className="text-xs text-ink-mute mt-1">
          Stored encrypted. Only the clinician you book with can read it.
        </p>
      </div>

      {state.error && (
        <p
          id="book-error"
          role="alert"
          className="text-sm text-oxblood border border-oxblood/30 bg-clay-wash px-3 py-2"
        >
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-clay w-full justify-center">
        {pending ? "Reserving…" : "Continue to payment →"}
      </button>
    </form>
  );
}
