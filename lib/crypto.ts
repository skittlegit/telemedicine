import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { requireEnv } from "@/lib/env";

/**
 * AES-256-GCM field-level encryption for PHI.
 * Wire format (base64): version(1) | iv(12) | tag(16) | ciphertext
 */
const ALGO = "aes-256-gcm";
const VERSION = 0x01;
const IV_LEN = 12;
const TAG_LEN = 16;

let cachedKey: Buffer | null = null;
function key(): Buffer {
  if (cachedKey) return cachedKey;
  const raw = requireEnv("PHI_ENCRYPTION_KEY");
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) {
    throw new Error("PHI_ENCRYPTION_KEY must decode to 32 bytes (base64)");
  }
  cachedKey = buf;
  return buf;
}

export function encryptPHI(plaintext: string | null | undefined): string | null {
  if (plaintext == null || plaintext === "") return null;
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([Buffer.from([VERSION]), iv, tag, enc]).toString("base64");
}

export function decryptPHI(payload: string | null | undefined): string | null {
  if (!payload) return null;
  const buf = Buffer.from(payload, "base64");
  if (buf.length < 1 + IV_LEN + TAG_LEN) throw new Error("ciphertext too short");
  if (buf[0] !== VERSION) throw new Error("unknown PHI cipher version");
  const iv = buf.subarray(1, 1 + IV_LEN);
  const tag = buf.subarray(1 + IV_LEN, 1 + IV_LEN + TAG_LEN);
  const enc = buf.subarray(1 + IV_LEN + TAG_LEN);
  const decipher = createDecipheriv(ALGO, key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

/* --------- Prescription HMAC ------------------------------------- */

let cachedHmacKey: Buffer | null = null;
function hmacKey(): Buffer {
  if (cachedHmacKey) return cachedHmacKey;
  const raw = requireEnv("PRESCRIPTION_HMAC_KEY");
  const buf = Buffer.from(raw, "base64");
  if (buf.length < 32) throw new Error("PRESCRIPTION_HMAC_KEY must be ≥32 bytes (base64)");
  cachedHmacKey = buf;
  return buf;
}

/**
 * Deterministic HMAC-SHA256 over canonical fields. Hex.
 * Used to make prescriptions independently verifiable.
 */
export function signPrescription(input: {
  id: string;
  doctorId: string;
  patientId: string;
  issuedAt: number;
  drugs: Array<{ name: string; dose: string; freq: string; days: number }>;
}): string {
  const canonical = JSON.stringify({
    id: input.id,
    d: input.doctorId,
    p: input.patientId,
    t: input.issuedAt,
    rx: input.drugs.map((x) => [x.name, x.dose, x.freq, x.days]),
  });
  return createHmac("sha256", hmacKey()).update(canonical).digest("hex");
}

export function verifyPrescription(
  input: Parameters<typeof signPrescription>[0],
  signature: string,
): boolean {
  const expected = signPrescription(input);
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
}

/** Random hex token (e.g. for verify URLs). */
export function token(bytes = 16): string {
  return randomBytes(bytes).toString("hex");
}
