"use client";

import { useEffect, useState } from "react";

type Stage = "claimed" | "preparing" | "out_for_delivery" | "delivered";

const STAGES: ReadonlyArray<{ key: Stage; label: string; eyebrow: string }> = [
  { key: "claimed", label: "Confirmed", eyebrow: "Order received" },
  { key: "preparing", label: "Preparing", eyebrow: "At the pharmacy" },
  { key: "out_for_delivery", label: "Out for delivery", eyebrow: "On the way" },
  { key: "delivered", label: "Delivered", eyebrow: "Complete" },
];

const STAGE_INDEX: Record<string, number> = {
  queued: 0,
  claimed: 0,
  preparing: 1,
  out_for_delivery: 2,
  delivered: 3,
  cancelled: -1,
};

export interface OrderTimelineProps {
  status: string;
  claimedAt?: string | Date | null;
  createdAt: string | Date;
}

/**
 * Mock fulfilment progress derived from elapsed time since claim. The real
 * DB status always wins if it's further along — this just animates the
 * intermediate steps so the demo feels alive without requiring a backend
 * worker to flip rows.
 */
export function OrderTimeline({ status, claimedAt, createdAt }: OrderTimelineProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (status === "cancelled") {
    return (
      <div className="border border-[color:var(--rule)] bg-paper-tint px-4 py-3 text-[13px] text-ink-soft">
        This order was cancelled.
      </div>
    );
  }

  const claimedTime = claimedAt
    ? new Date(claimedAt).getTime()
    : new Date(createdAt).getTime();
  const elapsed = Math.max(0, now - claimedTime);

  let derived: Stage = "claimed";
  if (elapsed >= 15 * 60_000) derived = "delivered";
  else if (elapsed >= 5 * 60_000) derived = "out_for_delivery";
  else if (elapsed >= 60_000) derived = "preparing";

  const dbIdx = STAGE_INDEX[status] ?? 0;
  const derivedIdx = STAGE_INDEX[derived] ?? 0;
  const currentIdx = Math.max(dbIdx, derivedIdx);
  const current = STAGES[currentIdx] ?? STAGES[0];

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-moss/40 bg-moss/10 eyebrow text-moss rounded-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-moss animate-pulse" aria-hidden />
          {current.label}
        </span>
        <span className="eyebrow text-ink-mute">{current.eyebrow}</span>
      </div>
      <ol className="grid grid-cols-4 gap-0">
        {STAGES.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <li key={s.key} className="relative flex flex-col items-start pr-3">
              <div className="flex items-center w-full">
                <span
                  className={`relative z-10 inline-flex items-center justify-center w-6 h-6 rounded-full border text-[10px] mono shrink-0 ${
                    done
                      ? "bg-moss border-moss text-paper"
                      : active
                        ? "bg-clay border-clay text-paper"
                        : "bg-paper border-[color:var(--rule-strong)] text-ink-mute"
                  }`}
                  aria-hidden
                >
                  {done ? "✓" : i + 1}
                </span>
                {i < STAGES.length - 1 && (
                  <span
                    className={`flex-1 h-px mx-1 ${
                      i < currentIdx
                        ? "bg-moss"
                        : "bg-[color:var(--rule-strong)] [background-image:repeating-linear-gradient(90deg,transparent_0_3px,currentColor_3px_5px)] text-[color:var(--rule-strong)]"
                    }`}
                    aria-hidden
                  />
                )}
              </div>
              <p
                className={`text-[12px] mt-2 leading-tight ${
                  active ? "text-ink font-semibold" : done ? "text-ink-soft" : "text-ink-mute"
                }`}
              >
                {s.label}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
