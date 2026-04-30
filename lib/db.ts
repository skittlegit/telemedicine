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
};

const globalForMongoose = globalThis as unknown as {
  __mongooseCache?: MongooseCache;
};

const cache: MongooseCache =
  globalForMongoose.__mongooseCache ?? { conn: null, promise: null };

if (!globalForMongoose.__mongooseCache) {
  globalForMongoose.__mongooseCache = cache;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

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

  return cache.conn;
}
