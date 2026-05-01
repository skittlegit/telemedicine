import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { PatientProfile } from "@/lib/models/PatientProfile";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeKeyCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * One-shot demo seed for the production DB on Vercel.
 *
 * Idempotent. Guarded by `BOOTSTRAP_KEY` env var — without it, the route is
 * inert (returns 404 to avoid advertising itself). Rate-limited to 3 attempts
 * per hour per IP; key comparison is timing-safe.
 *
 * Usage:
 *   curl -X POST "https://your-app.vercel.app/api/admin/bootstrap-seed?key=YOUR_BOOTSTRAP_KEY"
 */
export async function POST(req: NextRequest) {
  const expected = process.env.BOOTSTRAP_KEY;
  if (!expected) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";
  const rl = await rateLimit(`bootstrap-seed:${ip}`, {
    limit: 3,
    windowMs: 60 * 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "too many attempts" },
      {
        status: 429,
        headers: {
          "retry-after": String(Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))),
        },
      },
    );
  }

  const provided =
    req.nextUrl.searchParams.get("key") ?? h.get("x-bootstrap-key") ?? "";
  if (!safeKeyCompare(provided, expected)) {
    void audit({
      actorRole: "system:bootstrap-seed",
      action: "admin.bootstrap_seed.unauthorized",
      target: `ip:${ip}`,
    });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const upsertUser = async (opts: {
      email: string;
      name: string;
      role: "patient" | "doctor" | "pharmacist" | "admin";
      password: string;
    }) => {
      const existing = await User.findOne({ email: opts.email });
      if (existing) return existing;
      const passwordHash = await bcrypt.hash(opts.password, 12);
      return User.create({
        email: opts.email,
        name: opts.name,
        role: opts.role,
        passwordHash,
        status: "active",
      });
    };

    const patient = await upsertUser({
      email: "patient@vellum.test",
      name: "Eve Patient",
      role: "patient",
      password: "password123",
    });
    await PatientProfile.findOneAndUpdate(
      { user: patient._id },
      { user: patient._id },
      { upsert: true },
    );

    const docs = [
      { email: "doc.cardio@vellum.test", name: "Alice Heart", specialty: "Cardiology" },
      { email: "doc.gp@vellum.test", name: "Ben Stone", specialty: "General Practice" },
      { email: "doc.derm@vellum.test", name: "Cara Skin", specialty: "Dermatology" },
    ];
    for (const d of docs) {
      const u = await upsertUser({
        email: d.email,
        name: d.name,
        role: "doctor",
        password: "password123",
      });
      await DoctorProfile.findOneAndUpdate(
        { user: u._id },
        {
          user: u._id,
          specialty: d.specialty,
          bio: `Board-certified in ${d.specialty}. Demo seed.`,
          licenseNumber: "DEMO-1234",
          licenseRegion: "DEMO",
          licenseVerifiedAt: new Date(),
          yearsOfExperience: 10,
          languages: ["English"],
          consultationFeeCents: 89900,
        },
        { upsert: true, new: true },
      );
    }

    await upsertUser({
      email: "pharmacist@vellum.test",
      name: "Pat Pharmacy",
      role: "pharmacist",
      password: "password123",
    });

    await upsertUser({
      email: "admin@vellum.test",
      name: "Ada Admin",
      role: "admin",
      password: "password123",
    });

    void audit({
      actorRole: "system:bootstrap-seed",
      action: "admin.bootstrap_seed.success",
      target: `ip:${ip}`,
    });

    return NextResponse.json({
      ok: true,
      env: env.NODE_ENV,
      accounts: [
        "patient@vellum.test",
        "doc.cardio@vellum.test",
        "doc.gp@vellum.test",
        "doc.derm@vellum.test",
        "pharmacist@vellum.test",
        "admin@vellum.test",
      ],
      password: "password123",
      note: "All seed accounts share the same password. Rotate before any real use.",
    });
  } catch (err) {
    console.error("[bootstrap-seed] failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 },
    );
  }
}
