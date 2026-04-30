import mongoose from "mongoose";
import { env } from "@/lib/env";

/**
 * Mongoose connection cache.
 * Next.js (especially in dev with HMR and route-level module reuse) re-evaluates
 * server modules. We cache the connection on `globalThis` so we don't open a new
 * pool every request / refresh.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  bootstrapped: boolean;
};

const globalForMongoose = globalThis as unknown as {
  __mongooseCache?: MongooseCache;
};

const cache: MongooseCache =
  globalForMongoose.__mongooseCache ?? {
    conn: null,
    promise: null,
    bootstrapped: false,
  };

if (!globalForMongoose.__mongooseCache) {
  globalForMongoose.__mongooseCache = cache;
}

/**
 * Always-available admin so login works against any reachable database without
 * running the seed script. Email is on `vellum.health` (not `.test`) so it
 * never collides with the seed users in `npm run seed`.
 */
export const HARDCODED_ADMIN = {
  email: "admin@vellum.health",
  name: "Vellum Admin",
  password: env.ADMIN_PASSWORD ?? "admin123",
} as const;

/**
 * Demo accounts shown on the login page. Auto-provisioned on first DB connect
 * so reviewers can sign in without running `npm run seed`. The doctor and
 * pharmacist are created with verified licences so they can use the app
 * immediately.
 */
export const HARDCODED_DEMO_USERS = [
  {
    email: "patient@vellum.test",
    name: "Demo Patient",
    password: "patient123",
    role: "patient" as const,
  },
  {
    email: "doctor@vellum.test",
    name: "Demo Doctor",
    password: "doctor123",
    role: "doctor" as const,
    doctorProfile: {
      specialty: "Internal medicine",
      licenseNumber: "DEMO-DR-0001",
      licenseRegion: "CA-USA",
      yearsOfExperience: 8,
      languages: ["English"],
      consultationFeeCents: 5000,
    },
  },
  {
    email: "pharmacist@vellum.test",
    name: "Demo Pharmacist",
    password: "pharmacist123",
    role: "pharmacist" as const,
    pharmacyProfile: {
      pharmacyName: "Vellum Demo Pharmacy",
      licenseNumber: "DEMO-PH-0001",
      licenseRegion: "CA-USA",
    },
  },
] as const;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) {
    if (!cache.bootstrapped) await ensureHardcodedAdmin();
    return cache.conn;
  }

  if (!cache.promise) {
    const uri = env.MONGODB_URI;
    cache.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        // Surface auth/network failures fast in dev.
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => {
        // Strict query mode prevents typo-driven full-collection scans.
        m.set("strictQuery", true);
        return m;
      });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  await ensureHardcodedAdmin();
  return cache.conn;
}

/**
 * Idempotent upsert of the hardcoded admin user. Re-pins `passwordHash` on
 * every cold start so a rotated `ADMIN_PASSWORD` env var always takes effect.
 * Lazy-imports the User model to avoid module-load cycles.
 */
async function ensureHardcodedAdmin(): Promise<void> {
  if (cache.bootstrapped) return;
  try {
    const [{ User }, { DoctorProfile }, { PharmacyProfile }, bcryptModule] =
      await Promise.all([
        import("@/lib/models/User"),
        import("@/lib/models/DoctorProfile"),
        import("@/lib/models/PharmacyProfile"),
        import("bcryptjs"),
      ]);
    const bcrypt = bcryptModule.default ?? bcryptModule;

    // 1) Admin
    const adminHash = await bcrypt.hash(HARDCODED_ADMIN.password, 12);
    await User.updateOne(
      { email: HARDCODED_ADMIN.email },
      {
        $set: {
          passwordHash: adminHash,
          name: HARDCODED_ADMIN.name,
          role: "admin",
          status: "active",
        },
        $setOnInsert: { email: HARDCODED_ADMIN.email },
      },
      { upsert: true },
    );

    // 2) Demo users (patient / doctor / pharmacist) — pre-verified.
    const now = new Date();
    for (const u of HARDCODED_DEMO_USERS) {
      const passwordHash = await bcrypt.hash(u.password, 12);
      await User.updateOne(
        { email: u.email },
        {
          $set: {
            passwordHash,
            name: u.name,
            role: u.role,
            status: "active",
          },
          $setOnInsert: { email: u.email },
        },
        { upsert: true },
      );
      const doc = await User.findOne({ email: u.email })
        .select("_id")
        .lean<{ _id: mongoose.Types.ObjectId } | null>();
      if (!doc) continue;

      if ("doctorProfile" in u && u.doctorProfile) {
        await DoctorProfile.updateOne(
          { user: doc._id },
          {
            $set: {
              specialty: u.doctorProfile.specialty,
              licenseNumber: u.doctorProfile.licenseNumber,
              licenseRegion: u.doctorProfile.licenseRegion,
              yearsOfExperience: u.doctorProfile.yearsOfExperience,
              languages: [...u.doctorProfile.languages],
              consultationFeeCents: u.doctorProfile.consultationFeeCents,
              licenseVerifiedAt: now,
            },
            $setOnInsert: { user: doc._id },
          },
          { upsert: true },
        );
      }
      if ("pharmacyProfile" in u && u.pharmacyProfile) {
        await PharmacyProfile.updateOne(
          { user: doc._id },
          {
            $set: {
              pharmacyName: u.pharmacyProfile.pharmacyName,
              licenseNumber: u.pharmacyProfile.licenseNumber,
              licenseRegion: u.pharmacyProfile.licenseRegion,
              licenseVerifiedAt: now,
            },
            $setOnInsert: { user: doc._id },
          },
          { upsert: true },
        );
      }
    }

    cache.bootstrapped = true;
  } catch (err) {
    // Don't crash the request — log and try again on the next call.
    console.error("[ensureHardcodedAdmin] failed:", err);
    cache.bootstrapped = false;
  }
}

