"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function BookedBanner() {
  const sp = useSearchParams();
  const router = useRouter();
  const booked = sp.get("booked");
  const [open, setOpen] = useState(true);

  if (!booked || !open) return null;

  function dismiss() {
    setOpen(false);
    // Strip ?booked= from the URL without re-fetching.
    router.replace("/dashboard");
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booked-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-[2px] p-4"
    >
      <div className="w-full max-w-[440px] bg-paper border border-[color:var(--rule-strong)] shadow-2xl">
        <div className="px-6 pt-6 pb-2 flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-full bg-moss/15 text-moss flex items-center justify-center shrink-0"
            aria-hidden
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5 9-11" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="eyebrow text-moss mb-1">Booked</p>
            <h2
              id="booked-title"
              className="text-[20px] font-semibold tracking-[-0.018em] leading-[1.2]"
            >
              Your visit is confirmed.
            </h2>
            <p className="text-ink-soft text-[13.5px] mt-2 leading-[1.55]">
              We&apos;ve sent a confirmation email with the join link. The
              video room opens 5 minutes before your slot.
            </p>
          </div>
        </div>
        <div className="px-6 pb-6 pt-4 flex gap-2 justify-end">
          <button
            type="button"
            onClick={dismiss}
            className="btn btn-ghost btn-sm"
          >
            Dismiss
          </button>
          <Link
            href="/dashboard/visits"
            className="btn btn-clay btn-sm"
            onClick={() => setOpen(false)}
          >
            View visits →
          </Link>
        </div>
      </div>
    </div>
  );
}
