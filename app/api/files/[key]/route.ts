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
    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        "content-type": CONTENT_TYPES[ext] ?? "application/octet-stream",
        "cache-control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
