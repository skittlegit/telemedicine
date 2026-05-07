<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (Next 16.2.4 + React 19.2.4) has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Vellum Health — Agent Reference

> **Read this first, every time.** This file is the canonical fast-context for agents working on this repo. It supersedes guesses based on training data. If you change something architecturally meaningful, **update the relevant section at the bottom of this file before finishing your turn** (see "Self-update protocol").

[README.md](README.md), [PRODUCT.md](PRODUCT.md), and [DESIGN.md](DESIGN.md) are the long-form sources of truth. This document is the agent's index into them.

---

## 1. What this app is

Vellum Health is a flat-fee, video-first telemedicine clinic with same-day pharmacy fulfilment and field-level encrypted records. Portfolio implementation, not a real medical service.

Three success paths:
1. New patient books a consultation → pays via Stripe → joins WebRTC room.
2. Doctor signs a prescription (HMAC-signed, QR-verifiable).
3. Pharmacist claims a queued Rx order → fulfils → marks delivered.

---

## 2. Stack (exact versions matter)

| Layer | Choice |
|---|---|
| Framework | **Next.js 16.2.4** (App Router, Turbopack), **React 19.2.4** |
| Server | Custom Node server in [server.ts](server.ts) (Next + Socket.IO on same HTTP server) |
| Auth | **NextAuth v5** (`5.0.0-beta.31`), JWT sessions, Credentials provider |
| DB | **MongoDB** via **Mongoose 9** |
| Forms | `react-hook-form` + `zod` (resolvers in `@hookform/resolvers`) |
| Validation | **Zod 4** (note: `z.email()`, `z.iso.datetime()` — Zod 4 syntax) |
| Styling | **Tailwind v4** (`@tailwindcss/postcss`), CSS variables in [app/globals.css](app/globals.css) |
| Motion | `motion` v12 (import from `motion/react`) — **NOT** `framer-motion` |
| Icons | Custom SVGs in [app/_components/icons.tsx](app/_components/icons.tsx). `lucide-react` is installed but **forbidden in UI** |
| Payments | Stripe (Checkout + webhooks) |
| Realtime | Socket.IO 4 + `simple-peer` (WebRTC) |
| PDF | `@react-pdf/renderer` |
| Email | Resend (preferred) or SMTP via `nodemailer` |
| Storage | Local FS driver (S3 driver stubbed) |
| Tooling | `tsx` for dev/start, `vitest` for tests, ESLint 9 flat config |

`reactStrictMode: true`. `serverExternalPackages: ["mongoose", "@react-pdf/renderer", "bcryptjs"]` in [next.config.ts](next.config.ts).

---

## 3. Repo map

```
auth.ts                  NextAuth v5 config (single source for `auth`, `signIn`, `signOut`, `handlers`)
proxy.ts                 Next 16 replaces middleware.ts → coarse role gating
server.ts                Custom HTTP server: Next handler + Socket.IO at /api/socket
next.config.ts           CSP + security headers, serverExternalPackages
scripts/seed.ts          Demo data seed (npm run seed)
scripts/generate-keys.mjs  Prints fresh PHI / HMAC / NEXTAUTH secrets

app/
  page.tsx               Editorial landing (BRAND surface)
  layout.tsx             Root layout, fonts, MarketingChrome wrapper
  globals.css            Design tokens + primitives (.btn, .field, .well, .card, .eyebrow, .stamp)
  manifest.ts            PWA manifest

  (auth)/login, register   Credentials forms
  doctors/                 Public directory + [id] profile (BRAND)
  specialties/[slug]       Public taxonomy (BRAND)
  book/[doctorId]          Patient → Stripe Checkout
  consult/[appointmentId]  WebRTC room (ConsultRoom.tsx + ProcessShim.tsx)
  pharmacy/                Public marketplace
  pharmacy/order/[prescriptionId]  Patient creates fulfilment order
  verify/[token]           Public Rx verification (HMAC recompute)

  dashboard/               PRODUCT surface shell (Shell.tsx)
    page.tsx               Patient ledger
    profile/               Patient profile
    visits/, prescriptions/, records/, orders/, doctors/  Patient views
    clinician/             Doctor: prescribe, prescriptions, profile, schedule
    pharmacy/              Pharmacist: queue, active, history, listings, profile
    admin/                 Admin: approvals, audit, clinicians

  actions/                 Server actions (auth, booking, prescription, pharmacy, profile, admin)
  api/
    auth/[...nextauth]/    NextAuth handlers
    files/[key]/           Authenticated file serving
    health/                Health probe
    prescriptions/[id]/    PDF rendering
    webhooks/stripe/       Checkout / payment webhooks
    admin/bootstrap-seed/  One-shot prod seeder (BOOTSTRAP_KEY guarded)

lib/
  db.ts                   Mongoose connection cache + auto-provisioned admin/demo users
  env.ts                  Zod-validated env (single source of truth, fails fast)
  crypto.ts               encryptPHI / decryptPHI (AES-256-GCM) + signPrescription / verifyPrescription (HMAC-SHA256) + token()
  authz.ts                getSession / requireSession / requireRole(...roles)
  audit.ts                audit() — append-only, drops PHI keys, never throws
  email.ts, stripe.ts, storage.ts, ratelimit.ts, money.ts, utils.ts
  schemas.ts              Zod schemas (RegisterSchema, LoginSchema, BookingSchema, PrescriptionSchema, …)
  models/                 Mongoose: User, Appointment, Prescription, PharmacyOrder, PharmacyListing,
                            PharmacyProfile, DoctorProfile, PatientProfile, Payment, AuditLog, Setting
  pdf/PrescriptionPdf.tsx
```

---

## 4. Two surfaces — never mix them

[PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md) define the visual language. The single most important rule:

- **Brand surface** (`/`, `/doctors`, `/specialties/*`, marketing): editorial, italic-Fraunces accent, atmosphere gradients on `<html>`, `MarketingChrome` header.
- **Product surface** (`/dashboard/*`, `/book/*`, `/consult/*`, `/pharmacy`, `/(auth)/*`): clinical, functional, hairline grids, `AppShell` (`Shell.tsx`). **No** italic accent. **No** atmosphere gradients.

Tokens live in [app/globals.css](app/globals.css) (`--paper`, `--paper-tint`, `--paper-deep`, `--ink`, `--ink-soft`, `--ink-mute`, `--ink-faint`, `--clay`, `--clay-deep`, `--clay-wash`, `--accent`, `--moss`, `--amber`, `--oxblood`, `--rule`, `--rule-strong`). Use them. Do not introduce new fills.

Forbidden: `#000`/`#fff`, gradient buttons/text, card shadows, pill buttons (radius is 4px), animating layout properties, `lucide-react` in JSX, dark mode, stock photography. See DESIGN.md "Anti-patterns".

---

## 5. Security model — non-negotiable

1. **PHI at rest is encrypted.** Any free-text clinical field stored in Mongo uses `encryptPHI()` / `decryptPHI()` from [lib/crypto.ts](lib/crypto.ts). Field naming convention: **`*Enc` suffix** (`reasonEnc`, `notesEnc`, `diagnosisEnc`, `deliveryAddressEnc`). Keyed by `PHI_ENCRYPTION_KEY` (32-byte base64).
2. **Prescriptions are HMAC-signed.** `signPrescription()` over canonical `{id,doctor,patient,issuedAt,drugs[]}`. Public `/verify/[token]` recomputes via `verifyPrescription()`. Keyed by `PRESCRIPTION_HMAC_KEY`.
3. **Audit trail is append-only and PHI-free.** Use `audit()` from [lib/audit.ts](lib/audit.ts). It drops forbidden meta keys (`diagnosis`, `reason`, `notes`, `drugs`, `address`, `phone`, `dob`, `password`, `token`, `signature`, …). Never put PHI in audit meta.
4. **Authz everywhere.** [proxy.ts](proxy.ts) does coarse cookie/role gating (cannot touch DB on edge). Every server action / route handler **must** call `requireRole("...")` from [lib/authz.ts](lib/authz.ts). Roles: `"patient" | "doctor" | "pharmacist" | "admin"`.
5. **No PHI in URLs, query params, log output, or cookies.**
6. **CSP + security headers** are set in [next.config.ts](next.config.ts). Do not loosen without justification.
7. **Rate limiting** lives in [lib/ratelimit.ts](lib/ratelimit.ts) (token bucket, optional Upstash).

---

## 6. Auth specifics

- Session cookie name flips with HTTPS detection in `proxy.ts`: `__Secure-authjs.session-token` (https) vs `authjs.session-token` (http). Same logic in [server.ts](server.ts) for socket auth.
- Credentials only. Email + password. Status must be `"active"` to log in. Doctors register as `"pending"` until admin approval.
- Demo accounts and a hardcoded admin (`admin@vellum.health`) are auto-provisioned by [lib/db.ts](lib/db.ts) on first connect. In production `ADMIN_PASSWORD` env var is **required** — refuses to boot otherwise.
- JWT contains `sub` (user id) and `role`. Augmented types are declared in [auth.ts](auth.ts).

---

## 7. Data model summary

All ObjectIds via Mongoose. Timestamps on every collection.

- **User** — `email`, `passwordHash` (`select:false`), `name`, `role`, `status`, `image`, `emailVerifiedAt`, `lastLoginAt`.
- **DoctorProfile / PharmacyProfile / PatientProfile** — sit alongside User; profiles can be looked up by `_id` (used as `doctorId` in URLs).
- **Appointment** — `patient`, `doctor`, `startAt`, `endAt`, `durationMinutes` (default 30), `reasonEnc`, `notesEnc`, `status` (`pending_payment | scheduled | in_progress | completed | cancelled | no_show`), `feeCents`, `paymentIntentId`, `roomId`.
- **Prescription** — `appointment`, `doctor`, `patient`, `drugs[]`, `diagnosisEnc`, `issuedAt`, `signature` (HMAC), `verifyToken` (unique, public), `revokedAt`, `fulfilledAt`. Compound indexes on `(patient, createdAt)` and `(doctor, createdAt)` — keep them.
- **PharmacyOrder** — `kind` (`rx | marketplace`), `prescription?`, `patient`, `pharmacist?`, `pharmacy?`, `status` (`queued | claimed | preparing | out_for_delivery | delivered | cancelled`), `deliveryAddressEnc`, `totalCents`, `items[]`, `paymentIntentId`, `paidAt`, timestamps for state transitions. Rx orders start as `queued` and only the assigned `pharmacy` (User) can claim once `paidAt` is set; transitions then require both `pharmacy` and `pharmacist` to match the actor.
- **Setting** — singleton key/value store. Currently used for `payments.enabled`. Read via `paymentsEnabled()` from [lib/settings.ts](lib/settings.ts); when false, booking and pharmacy actions skip Stripe Checkout and confirm directly.
- **PharmacyListing** — marketplace inventory.
- **Payment** — Stripe session/intent tracking.
- **AuditLog** — `actor`, `actorRole`, `action`, `target`, `ip`, `userAgent`, `meta` (sanitized).

---

## 8. Realtime / consult room

- Socket.IO mounted by [server.ts](server.ts) at `SOCKET_PATH` (default `/api/socket`).
- Auth middleware in `server.ts` decodes the NextAuth JWT cookie itself (because socket connections don't run through Next).
- Events: `room:join`, `room:members`, `peer:joined`, `peer:left`, `signal`, `chat`, `disconnecting`.
- WebRTC peer connection driven by `simple-peer` in `app/consult/[appointmentId]/ConsultRoom.tsx`.
- **Known Turbopack quirk:** `simple-peer` may need `window.process = { env: {} }` shim — see `app/consult/[appointmentId]/ProcessShim.tsx`. Keep it.

---

## 9. Server actions and forms

Pattern (followed across `app/actions/*.ts`):

```ts
"use server";
export async function fooAction(_prev: State, formData: FormData): Promise<State> {
  const session = await requireRole("patient"); // always first
  const parsed = SomeSchema.safeParse(/* extract from formData */);
  if (!parsed.success) return { error: "..." };
  await connectDB();
  // ...mutate
  await audit({ actor: session.user.id, actorRole: "patient", action: "x.y", target: "..." });
  redirect("/dashboard?...");
}
```

Forms use `react-hook-form` on the client and `useActionState` on the server. JSON-encode complex sub-structures (e.g. `drugs`) into a hidden form field — this is the established pattern, do not change it.

---

## 10. Environment variables

Single source of truth: [lib/env.ts](lib/env.ts). The schema fails fast at startup with a readable error. Required: `MONGODB_URI`, `NEXTAUTH_SECRET`, `PHI_ENCRYPTION_KEY`, `PRESCRIPTION_HMAC_KEY` (all base64 ≥32 bytes for the crypto keys). Optional: Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`), SMTP/Resend, TURN, Upstash, S3, `BOOTSTRAP_KEY`, `ADMIN_PASSWORD` (required in prod), `SOCKET_PATH`, `NEXT_PUBLIC_STUN_URLS`.

Generate fresh keys with `npm run keys`.

If Stripe envs are missing, booking and pharmacy flows skip Checkout and auto-confirm. **Admins can also force payments off at runtime** via `/dashboard/admin/settings` — same effect (`paymentsEnabled()` short-circuits the Stripe path). SMTP-less environments log emails to stdout.

---

## 11. Common scripts

```powershell
npm run dev            # tsx server.ts with .env.local
npm run build          # next build
npm start              # production: tsx server.ts
npm run lint           # eslint
npm run seed           # scripts/seed.ts (demo data)
npm run keys           # print fresh secrets
npm run stripe:listen  # forward Stripe webhooks to localhost
```

Use **PowerShell**-compatible commands on Windows. Never chain with `&&` — use `;` or run sequentially.

---

## 12. Conventions an agent must follow

- Path alias: `@/*` → repo root. Use it.
- **No** new `lucide-react` imports in JSX. Add icons to `app/_components/icons.tsx` matching `stroke-width="1.5"`, `stroke="currentColor"`, `fill="none"`.
- Encrypted fields end in `Enc`. Never read/write them without going through [lib/crypto.ts](lib/crypto.ts).
- Server actions live under `app/actions/`. Page-local actions are acceptable when single-use.
- Mongoose models always guard against re-registration: `(models.Foo as Model<X>) || model<X>("Foo", schema)`.
- Always `await connectDB()` before any model call in a request path.
- `proxy.ts` is the Next 16 replacement for `middleware.ts`. Do not recreate `middleware.ts`.
- Motion: import from `motion/react`. Animate only `opacity` and `transform`. Easing `cubic-bezier(0.22,0.61,0.36,1)`.
- 4px button radius. Hairline borders, never `box-shadow`.
- Brand vs product surface separation is non-negotiable — see §4.
- Read `node_modules/next/dist/docs/` before assuming Next.js APIs (see top banner).

---

## 13. Self-update protocol (read this if you changed code)

Before completing any non-trivial change, update the section(s) of this file that became stale:

- New env var → §10.
- New model / new field / changed enum → §7.
- New server action with a deviating pattern → §9.
- New top-level route or shifted surface assignment → §3, §4.
- New Socket.IO event → §8.
- Loosened or tightened security primitive → §5.
- New script in `package.json` → §11.
- New convention worth enforcing → §12.
- Stack version bump that changes APIs → §2 and the Next.js banner at the top.

Keep edits minimal — one or two lines per change. **Do not** mirror commit history here; this file should always read as the current state, not a changelog. If you remove something from the codebase, remove its entry too. If you discover something this file got wrong, fix it the same turn.
