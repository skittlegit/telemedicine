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
    name: "Deepak Aeleni",
    password: "password123",
    role: "patient" as const,
  },
  // Doctors — three named clinicians spanning specialties. Demo accounts
  // come from the database, not from a single canned doctor login.
  {
    email: "doc.gp@vellum.test",
    name: "Pranav Mitta",
    password: "password123",
    role: "doctor" as const,
    doctorProfile: {
      // Must match the slug list in app/_components/icons.tsx (lowercase "p").
      specialty: "General practice",
      bio: "MBBS, MD – General Medicine. 12 years of clinical practice across Delhi NCR.",
      licenseNumber: "DEMO-DR-0001",
      licenseRegion: "DL",
      yearsOfExperience: 12,
      languages: ["English", "Hindi"],
      consultationFeeCents: 89900,
    },
  },
  {
    email: "doc.cardio@vellum.test",
    name: "Satyaki Tirumal",
    password: "password123",
    role: "doctor" as const,
    doctorProfile: {
      specialty: "Cardiology",
      bio: "DM Cardiology, AIIMS Bengaluru. Interventional cardiologist with 14 years of experience.",
      licenseNumber: "DEMO-DR-0002",
      licenseRegion: "KA",
      yearsOfExperience: 14,
      languages: ["English", "Kannada", "Tamil"],
      consultationFeeCents: 89900,
    },
  },
  {
    email: "doc.derm@vellum.test",
    name: "Nishal Karmasetty",
    password: "password123",
    role: "doctor" as const,
    doctorProfile: {
      specialty: "Dermatology",
      bio: "MD Dermatology, KEM Mumbai. Specialising in medical and cosmetic dermatology.",
      licenseNumber: "DEMO-DR-0003",
      licenseRegion: "MH",
      yearsOfExperience: 9,
      languages: ["English", "Hindi", "Marathi"],
      consultationFeeCents: 89900,
    },
  },
  {
    email: "doc.neuro@vellum.test",
    name: "Ankit Shankar",
    password: "password123",
    role: "doctor" as const,
    doctorProfile: {
      specialty: "Neurology",
      bio: "DM Neurology, SCTIMST Thiruvananthapuram. Stroke and epilepsy specialist with 15 years of experience.",
      licenseNumber: "DEMO-DR-0004",
      licenseRegion: "KL",
      yearsOfExperience: 15,
      languages: ["English", "Malayalam"],
      consultationFeeCents: 89900,
    },
  },
  {
    email: "doc.ortho@vellum.test",
    name: "Sanvi Vajnepalli",
    password: "password123",
    role: "doctor" as const,
    doctorProfile: {
      specialty: "Orthopaedics",
      bio: "MS Orthopaedics, B.J. Medical College Ahmedabad. Joint replacement and sports injury specialist.",
      licenseNumber: "DEMO-DR-0005",
      licenseRegion: "GJ",
      yearsOfExperience: 11,
      languages: ["English", "Hindi", "Gujarati"],
      consultationFeeCents: 89900,
    },
  },
  {
    email: "doc.peds@vellum.test",
    name: "Ankita Vemavarapu",
    password: "password123",
    role: "doctor" as const,
    doctorProfile: {
      specialty: "Paediatrics",
      bio: "MD Paediatrics, Madras Medical College Chennai. Newborn and child health specialist.",
      licenseNumber: "DEMO-DR-0006",
      licenseRegion: "TN",
      yearsOfExperience: 8,
      languages: ["English", "Tamil"],
      consultationFeeCents: 89900,
    },
  },
  {
    email: "doc.psych@vellum.test",
    name: "Rishi Pabbathi",
    password: "password123",
    role: "doctor" as const,
    doctorProfile: {
      specialty: "Psychiatry",
      bio: "MD Psychiatry, NIMHANS Bengaluru. Specialising in anxiety, depression, and sleep disorders.",
      licenseNumber: "DEMO-DR-0007",
      licenseRegion: "KL",
      yearsOfExperience: 10,
      languages: ["English", "Malayalam", "Hindi"],
      consultationFeeCents: 89900,
    },
  },
  {
    email: "doc.sexo@vellum.test",
    name: "Sushan Govardhanam",
    password: "password123",
    role: "doctor" as const,
    doctorProfile: {
      specialty: "Sexology",
      bio: "MD Sexology, AIIMS Hyderabad. Specialising in sexual health, fertility, and relationship counselling.",
      licenseNumber: "DEMO-DR-0008",
      licenseRegion: "TS",
      yearsOfExperience: 6,
      languages: ["English", "Telugu", "Hindi"],
      consultationFeeCents: 89900,
    },
  },
  // Pharmacies — five verified dispensaries. The first surfaces as the
  // demo pharmacist account on the login page.
  {
    email: "rx-1@vellum.test",
    name: "Apollo Medicals",
    password: "password123",
    role: "pharmacist" as const,
    pharmacyProfile: {
      pharmacyName: "Apollo Medicals",
      licenseNumber: "RX-2026-0001",
      licenseRegion: "MH",
      addressLine1: "14 Linking Road, Bandra West",
      city: "Mumbai",
      region: "MH",
      postalCode: "400050",
      country: "IN",
      phone: "+91 22 2655 0101",
    },
  },
  {
    email: "rx-2@vellum.test",
    name: "MedPlus Pharmacy",
    password: "password123",
    role: "pharmacist" as const,
    pharmacyProfile: {
      pharmacyName: "MedPlus Pharmacy",
      licenseNumber: "RX-2026-0002",
      licenseRegion: "KA",
      addressLine1: "82 Brigade Road",
      city: "Bengaluru",
      region: "KA",
      postalCode: "560025",
      country: "IN",
      phone: "+91 80 4112 0202",
    },
  },
  {
    email: "rx-3@vellum.test",
    name: "Wellness Forever",
    password: "password123",
    role: "pharmacist" as const,
    pharmacyProfile: {
      pharmacyName: "Wellness Forever",
      licenseNumber: "RX-2026-0003",
      licenseRegion: "DL",
      addressLine1: "C-12 Connaught Place",
      city: "New Delhi",
      region: "DL",
      postalCode: "110001",
      country: "IN",
      phone: "+91 11 4155 0303",
    },
  },
  {
    email: "rx-4@vellum.test",
    name: "Netmeds Store",
    password: "password123",
    role: "pharmacist" as const,
    pharmacyProfile: {
      pharmacyName: "Netmeds Store",
      licenseNumber: "RX-2026-0004",
      licenseRegion: "TN",
      addressLine1: "45 Anna Salai",
      city: "Chennai",
      region: "TN",
      postalCode: "600002",
      country: "IN",
      phone: "+91 44 2851 0404",
    },
  },
  {
    email: "rx-5@vellum.test",
    name: "Medlink Pharmacy",
    password: "password123",
    role: "pharmacist" as const,
    pharmacyProfile: {
      pharmacyName: "Medlink Pharmacy",
      licenseNumber: "RX-2026-0005",
      licenseRegion: "TS",
      addressLine1: "8 Banjara Hills Road No.12",
      city: "Hyderabad",
      region: "TS",
      postalCode: "500034",
      country: "IN",
      phone: "+91 40 6677 0505",
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

