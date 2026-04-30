import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { env } from "@/lib/env";
import { token } from "@/lib/crypto";

export interface StoredFile {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

/**
 * Minimal storage abstraction. Local FS by default; S3 stub left as TODO
 * to avoid pulling the AWS SDK before it's needed.
 */
export async function putObject(
  buf: Buffer,
  contentType: string,
  ext: string,
): Promise<StoredFile> {
  if (env.STORAGE_DRIVER === "s3") {
    throw new Error("S3 driver not yet implemented");
  }
  const dir = resolve(env.UPLOADS_DIR);
  await mkdir(dir, { recursive: true });
  const safeExt = ext.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "bin";
  const key = `${token(12)}.${safeExt}`;
  const filePath = join(dir, key);
  await writeFile(filePath, buf);
  return {
    key,
    // Files served via /api/files/[key] handler
    url: `/api/files/${key}`,
    size: buf.length,
    contentType,
  };
}
