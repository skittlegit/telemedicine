import { NextResponse, type NextRequest } from "next/server";
import { readFile, stat } from "node:fs/promises";
import { resolve, join, basename } from "node:path";
import { env } from "@/lib/env";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  txt: "text/plain; charset=utf-8",
  bin: "application/octet-stream",
};

/**
 * Magic-byte signatures keyed by extension. Bytes must appear at offset 0
 * unless `offset` is given. We refuse to serve files whose contents disagree
 * with their extension — a deeper check than relying on the upload code path.
 */
const MAGIC: Record<
  string,
  { bytes: number[]; offset?: number }[] | "any"
> = {
  pdf: [{ bytes: [0x25, 0x50, 0x44, 0x46] }], // %PDF
  png: [{ bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  jpg: [{ bytes: [0xff, 0xd8, 0xff] }],
  jpeg: [{ bytes: [0xff, 0xd8, 0xff] }],
  webp: [{ bytes: [0x52, 0x49, 0x46, 0x46] }, { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }],
  txt: "any",
  bin: "any",
};

function magicMatches(ext: string, buf: Buffer): boolean {
  const sig = MAGIC[ext];
  if (!sig) return false;
  if (sig === "any") return true;
  // For multi-signature entries (e.g. webp), all entries must match.
  return sig.every(({ bytes, offset = 0 }) => {
    if (buf.length < offset + bytes.length) return false;
    for (let i = 0; i < bytes.length; i++) {
      if (buf[offset + i] !== bytes[i]) return false;
    }
    return true;
  });
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ key: string }> },
) {
  // Route handlers can't `redirect()` — return JSON 401 instead.
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { key } = await context.params;

  // Defence-in-depth: prevent path traversal.
  const safe = basename(key);
  if (safe !== key || safe.includes("..")) {
    return NextResponse.json({ error: "bad key" }, { status: 400 });
  }

  const dir = resolve(env.UPLOADS_DIR);
  const filePath = join(dir, safe);

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("not a file");
    const buf = await readFile(filePath);
    const ext = safe.split(".").pop()?.toLowerCase() ?? "bin";

    // Reject mismatched content even if the extension is allow-listed.
    if (!magicMatches(ext, buf)) {
      return NextResponse.json(
        { error: "content does not match extension" },
        { status: 415 },
      );
    }

    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        "content-type": CONTENT_TYPES[ext] ?? "application/octet-stream",
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
        "content-disposition": `inline; filename="${safe}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}

