import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liveness + DB ping. Returns 200 only if the Mongo connection succeeds.
 */
export async function GET() {
  const startedAt = Date.now();
  try {
    if (!env.MONGODB_URI) {
      return NextResponse.json(
        { ok: false, db: "unconfigured", message: "MONGODB_URI not set" },
        { status: 503 },
      );
    }

    const conn = await connectDB();
    const ping = await conn.connection.db?.admin().ping();

    return NextResponse.json({
      ok: true,
      db: ping?.ok === 1 ? "up" : "unknown",
      latencyMs: Date.now() - startedAt,
      app: "vellum-health",
      env: env.NODE_ENV,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        db: "down",
        latencyMs: Date.now() - startedAt,
        error: err instanceof Error ? err.message : "unknown",
      },
      { status: 503 },
    );
  }
}
