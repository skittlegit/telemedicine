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
 *
 * In production, `ADMIN_PASSWORD` is required — we refuse to fall back to the
 * dev default so a public deploy can never ship a known admin login.
 */
function resolveAdminPassword(): string {
  if (env.ADMIN_PASSWORD) return env.ADMIN_PASSWORD;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[vellum] ADMIN_PASSWORD is required in production. Refusing to seed the " +
        "hardcoded admin with the dev default. Set ADMIN_PASSWORD and redeploy.",
    );
  }
  return "admin123";
}

export const HARDCODED_ADMIN = {
  email: "admin@vellum.health",
  name: "Vellum Admin",
  get password(): string {
    return resolveAdminPassword();
  },
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
    name: "Eve Patient",
    password: "password123",
    role: "patient" as const,
  },
  // Doctors — three named clinicians spanning specialties. Demo accounts
  // come from the database, not from a single canned doctor login.
  {
    email: "doc.gp@vellum.test",
    name: "Ben Stone",
    password: "password123",
    role: "doctor" as const,
    doctorProfile: {
      // Must match the slug list in app/_components/icons.tsx (lowercase "p").
      specialty: "General practice",
      bio: "Board-certified GP. Demo seed.",
      licenseNumber: "DEMO-DR-0001",
      licenseRegion: "DEMO",
      yearsOfExperience: 12,
      languages: ["English"],
      consultationFeeCents: 89900,
    },
  },
  {
    email: "doc.cardio@vellum.test",
    name: "Alice Heart",
    password: "password123",
    role: "doctor" as const,
    doctorProfile: {
      specialty: "Cardiology",
      bio: "Board-certified in Cardiology. Demo seed.",
      licenseNumber: "DEMO-DR-0002",
      licenseRegion: "DEMO",
      yearsOfExperience: 14,
      languages: ["English"],
      consultationFeeCents: 89900,
    },
  },
  {
    email: "doc.derm@vellum.test",
    name: "Cara Skin",
    password: "password123",
    role: "doctor" as const,
    doctorProfile: {
      specialty: "Dermatology",
      bio: "Board-certified in Dermatology. Demo seed.",
      licenseNumber: "DEMO-DR-0003",
      licenseRegion: "DEMO",
      yearsOfExperience: 9,
      languages: ["English"],
      consultationFeeCents: 89900,
    },
  },
  // Pharmacies — four verified dispensaries. The first surfaces as the
  // demo pharmacist account on the login page.
  {
    email: "rx-1@vellum.test",
    name: "Dovetail Pharmacy",
    password: "password123",
    role: "pharmacist" as const,
    pharmacyProfile: {
      pharmacyName: "Dovetail Pharmacy",
      licenseNumber: "RX-2026-0001",
      licenseRegion: "NY",
      addressLine1: "212 Smith Street",
      city: "Brooklyn",
      region: "NY",
      postalCode: "11231",
      country: "US",
      phone: "+1 718 555 0101",
    },
  },
  {
    email: "rx-2@vellum.test",
    name: "Cedar Apothecary",
    password: "password123",
    role: "pharmacist" as const,
    pharmacyProfile: {
      pharmacyName: "Cedar Apothecary",
      licenseNumber: "RX-2026-0002",
      licenseRegion: "TX",
      addressLine1: "1108 East Cesar Chavez St",
      city: "Austin",
      region: "TX",
      postalCode: "78702",
      country: "US",
      phone: "+1 512 555 0102",
    },
  },
  {
    email: "rx-3@vellum.test",
    name: "Riverside Rx",
    password: "password123",
    role: "pharmacist" as const,
    pharmacyProfile: {
      pharmacyName: "Riverside Rx",
      licenseNumber: "RX-2026-0003",
      licenseRegion: "OR",
      addressLine1: "4140 SE Hawthorne Blvd",
      city: "Portland",
      region: "OR",
      postalCode: "97214",
      country: "US",
      phone: "+1 503 555 0103",
    },
  },
  {
    email: "rx-4@vellum.test",
    name: "Lantern Pharmacy",
    password: "password123",
    role: "pharmacist" as const,
    pharmacyProfile: {
      pharmacyName: "Lantern Pharmacy",
      licenseNumber: "RX-2026-0004",
      licenseRegion: "MA",
      addressLine1: "1320 Massachusetts Ave",
      city: "Cambridge",
      region: "MA",
      postalCode: "02138",
      country: "US",
      phone: "+1 617 555 0104",
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
    //    Only seeded in non-production environments. We refuse to ship known
    //    plaintext passwords (`patient123`, etc.) into a production database.
    if (process.env.NODE_ENV === "production") {
      cache.bootstrapped = true;
      return;
    }

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
        const dp = u.doctorProfile as {
          specialty: string;
          licenseNumber: string;
          licenseRegion: string;
          yearsOfExperience: number;
          languages: ReadonlyArray<string>;
          consultationFeeCents: number;
          bio?: string;
        };
        await DoctorProfile.updateOne(
          { user: doc._id },
          {
            $set: {
              specialty: dp.specialty,
              bio: dp.bio,
              licenseNumber: dp.licenseNumber,
              licenseRegion: dp.licenseRegion,
              yearsOfExperience: dp.yearsOfExperience,
              languages: [...dp.languages],
              consultationFeeCents: dp.consultationFeeCents,
              licenseVerifiedAt: now,
            },
            $setOnInsert: { user: doc._id },
          },
          { upsert: true },
        );
      }
      if ("pharmacyProfile" in u && u.pharmacyProfile) {
        const pp = u.pharmacyProfile as {
          pharmacyName: string;
          licenseNumber: string;
          licenseRegion: string;
          addressLine1?: string;
          city?: string;
          region?: string;
          postalCode?: string;
          country?: string;
          phone?: string;
        };
        await PharmacyProfile.updateOne(
          { user: doc._id },
          {
            $set: {
              pharmacyName: pp.pharmacyName,
              licenseNumber: pp.licenseNumber,
              licenseRegion: pp.licenseRegion,
              addressLine1: pp.addressLine1,
              city: pp.city,
              region: pp.region,
              postalCode: pp.postalCode,
              country: pp.country,
              phone: pp.phone,
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

