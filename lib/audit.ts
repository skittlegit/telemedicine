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
 * Keys that must NEVER appear in audit `meta`. Audit logs are retained
 * long-term and pulled up in security investigations — keeping PHI out of
 * them is essential for HIPAA minimum-necessary compliance.
 */
const FORBIDDEN_META_KEYS = new Set([
  "diagnosis",
  "diagnosisEnc",
  "reason",
  "reasonEnc",
  "notes",
  "allergies",
  "medications",
  "drugs",
  "address",
  "deliveryAddress",
  "deliveryAddressEnc",
  "addressLine1",
  "addressLine2",
  "phone",
  "dob",
  "ssn",
  "password",
  "token",
  "verifyToken",
  "signature",
]);

/**
 * Sanitise `meta` so audit rows can never accidentally store PHI/PII or
 * secrets. Forbidden keys are dropped entirely with a warning. Values larger
 * than 1KB are truncated. Strings are passed through; everything else is
 * preserved as-is.
 */
function validateAuditMeta(
  meta: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (FORBIDDEN_META_KEYS.has(key)) {
      console.warn(`[audit] dropped forbidden meta key: ${key}`);
      continue;
    }
    if (typeof value === "string" && value.length > 1024) {
      out[key] = value.slice(0, 1024) + "…[truncated]";
    } else {
      out[key] = value;
    }
  }
  return out;
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
      meta: validateAuditMeta(evt.meta),
    });
  } catch (err) {
    console.error("[audit] failed:", err);
  }
}

