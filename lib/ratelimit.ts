import { env } from "@/lib/env";

/**
 * Tiny in-memory token bucket. Process-local, fine for single-instance dev.
 * Swap for Upstash Redis in production via UPSTASH_* env vars.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export async function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): Promise<RateLimitResult> {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return upstashLimit(key, opts);
  }
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    const fresh = { count: 1, resetAt: now + opts.windowMs };
    buckets.set(key, fresh);
    return { ok: true, remaining: opts.limit - 1, resetAt: fresh.resetAt };
  }
  b.count += 1;
  if (b.count > opts.limit) {
    return { ok: false, remaining: 0, resetAt: b.resetAt };
  }
  return { ok: true, remaining: opts.limit - b.count, resetAt: b.resetAt };
}

async function upstashLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): Promise<RateLimitResult> {
  const url = env.UPSTASH_REDIS_REST_URL!;
  const token = env.UPSTASH_REDIS_REST_TOKEN!;
  const windowSec = Math.ceil(opts.windowMs / 1000);
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, windowSec, "NX"],
      ["TTL", key],
    ]),
    cache: "no-store",
  });
  const json = (await res.json()) as Array<{ result: number }>;
  const count = json[0]?.result ?? 1;
  const ttl = json[2]?.result ?? windowSec;
  const resetAt = Date.now() + ttl * 1000;
  return {
    ok: count <= opts.limit,
    remaining: Math.max(0, opts.limit - count),
    resetAt,
  };
}
