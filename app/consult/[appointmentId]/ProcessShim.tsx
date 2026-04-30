"use client";

import { useEffect } from "react";

/**
 * `simple-peer` references CommonJS-style globals (`process`, `global`)
 * that don't exist in modern bundlers (Turbopack/Vercel). Patch them on the
 * client before the consult room mounts.
 */
export function ProcessShim() {
  useEffect(() => {
    const w = window as unknown as {
      process?: { env: Record<string, string | undefined>; nextTick?: (cb: () => void) => void };
      global?: unknown;
    };
    if (!w.process) {
      w.process = {
        env: {},
        nextTick: (cb: () => void) => Promise.resolve().then(cb),
      };
    }
    if (!w.global) w.global = window;
  }, []);
  return null;
}
