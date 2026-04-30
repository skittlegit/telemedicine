import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";
import { token } from "@/lib/crypto";

export interface StoredFile {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

let s3Client: S3Client | null = null;

function s3(): S3Client {
  if (s3Client) return s3Client;
  if (!env.S3_REGION || !env.S3_BUCKET) {
    throw new Error("S3 driver requires S3_REGION and S3_BUCKET");
  }
  s3Client = new S3Client({
    region: env.S3_REGION,
    credentials:
      env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: env.S3_ACCESS_KEY_ID,
            secretAccessKey: env.S3_SECRET_ACCESS_KEY,
          }
        : undefined, // fall back to AWS SDK default chain (IAM role / env vars)
  });
  return s3Client;
}

/**
 * Storage abstraction: local FS in dev, S3 in production when STORAGE_DRIVER=s3.
 * Returns a key + URL the app can render; for S3 the URL is a 5-minute
 * presigned GET so we never expose bucket-public objects.
 */
export async function putObject(
  buf: Buffer,
  contentType: string,
  ext: string,
): Promise<StoredFile> {
  const safeExt = ext.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "bin";
  const key = `${token(12)}.${safeExt}`;

  if (env.STORAGE_DRIVER === "s3") {
    const client = s3();
    await client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: buf,
        ContentType: contentType,
        ServerSideEncryption: "AES256",
      }),
    );
    const url = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
      { expiresIn: 300 },
    );
    return { key, url, size: buf.length, contentType };
  }

  const dir = resolve(env.UPLOADS_DIR);
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, key);
  await writeFile(filePath, buf);
  return {
    key,
    url: `/api/files/${key}`,
    size: buf.length,
    contentType,
  };
}

/** Mint a fresh presigned URL for an existing S3 object. */
export async function presign(key: string, expiresIn = 300): Promise<string> {
  if (env.STORAGE_DRIVER !== "s3") return `/api/files/${key}`;
  return getSignedUrl(
    s3(),
    new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
    { expiresIn },
  );
}
