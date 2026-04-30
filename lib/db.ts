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
    const [{ User }, bcryptModule] = await Promise.all([
      import("@/lib/models/User"),
      import("bcryptjs"),
    ]);
    const bcrypt = bcryptModule.default ?? bcryptModule;
    const passwordHash = await bcrypt.hash(HARDCODED_ADMIN.password, 12);
    await User.updateOne(
      { email: HARDCODED_ADMIN.email },
      {
        $set: {
          passwordHash,
          name: HARDCODED_ADMIN.name,
          role: "admin",
          status: "active",
        },
        $setOnInsert: { email: HARDCODED_ADMIN.email },
      },
      { upsert: true },
    );
    cache.bootstrapped = true;
  } catch (err) {
    // Don't crash the request — log and try again on the next call.
    console.error("[ensureHardcodedAdmin] failed:", err);
    cache.bootstrapped = false;
  }
}

