import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { AuditLog } from "@/lib/models/AuditLog";

interface AuditEvent {
  actor?: string | null;
  actorRole?: string | null;
  action: string;
  target?: string;
  meta?: Record<string, unknown>;
}

/**
 * Append an audit event. Best-effort: never throws into the caller's request path.
 */
export async function audit(evt: AuditEvent): Promise<void> {
  try {
    const h = await headers();
    await connectDB();
    await AuditLog.create({
      actor: evt.actor ?? undefined,
      actorRole: evt.actorRole ?? undefined,
      action: evt.action,
      target: evt.target,
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? undefined,
      userAgent: h.get("user-agent") ?? undefined,
      meta: evt.meta,
      at: new Date(),
    });
  } catch (err) {
    console.error("[audit] failed:", err);
  }
}
