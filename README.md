# Vellum Health

A telemedicine platform: encrypted video consultations, signed prescriptions, lab test requests, pharmacy fulfilment, insurance-compatible invoicing, and immutable audit. Built on Next.js 16 (App Router, Turbopack), MongoDB / Mongoose, NextAuth v5, Stripe, and Socket.IO + WebRTC.

## Features

- **Booking & video consults** — patients book a slot, pay via Stripe (or skip if Stripe is unconfigured), and join an encrypted WebRTC room
- **Digital prescriptions** — HMAC-SHA256 signed; QR-verifiable at a public `/verify/[token]` page; PDF rendered on demand
- **Lab test requests** — doctors order lab tests live during the consultation; PDF available to both doctor and patient
- **Insurance invoices** — superbill-style PDF with CPT codes and Place of Service 02 (telehealth), for every completed visit
- **Pharmacy module** — patients send prescriptions to one of five seeded dispensaries for home delivery, or order from a marketplace catalog
- **Admin console** — clinician/pharmacy approvals, unified roster, audit browser, and a runtime toggle to force payments on/off
- **Field-level encryption** — every PHI string at rest is AES-256-GCM ciphertext
- **Append-only audit log** — every PHI access and mutation is recorded; meta is PHI-scrubbed

## Quick start

Requires Node 26.

```powershell
npm install
npm run keys                    # prints fresh secrets
Copy-Item .env.example .env.local
# paste the keys output into .env.local

# start MongoDB (or set MONGODB_URI to Atlas)
docker run -d -p 27017:27017 --name vellum-mongo mongo:7

npm run seed                    # demo accounts (password: password123)
npm run dev                     # http://localhost:3000
```

### Demo accounts

`npm run seed` provisions these (all share the password `password123`):

| Role       | Email                       | Notes                                              |
| ---------- | --------------------------- | -------------------------------------------------- |
| Patient    | `patient@vellum.test`       | Seeded with an orderable prescription + past visits |
| Doctor     | `doc.gp@vellum.test`        | General practice — plus 7 more `doc.*@vellum.test`  |
| Doctor     | `doc.cardio@vellum.test`    | Cardiology                                          |
| Doctor     | `doc.derm@vellum.test`      | Dermatology (also `neuro`, `ortho`, `peds`, `psych`, `sexo`) |
| Pharmacist | `rx-1@vellum.test`          | Apollo Medicals — plus `rx-2` … `rx-5`             |
| Admin      | `admin@vellum.test`         | Approvals, roster, audit, settings                 |

## Architecture

```
app/
  page.tsx                            Editorial landing page
  (auth)/login, (auth)/register       NextAuth credentials forms
  doctors/                            Public directory + profile
  specialties/[slug]                  Public specialty taxonomy
  book/[doctorId]                     Patient booking → Stripe Checkout
  consult/[appointmentId]             WebRTC + Socket.IO video room (Lab Orders panel)
  verify/[token]                      Public Rx verification (HMAC)
  dashboard/                          Patient & doctor ledger
  dashboard/visits                    Past visits → Invoice PDF + Lab Orders PDF
  dashboard/clinician/prescribe/[id]  Issue prescription
  dashboard/clinician/schedule        Doctor's past visits → Invoice + Lab Orders PDFs
  dashboard/pharmacy/                 Pharmacist queue / active / history / listings
  dashboard/admin/                    Approvals, roster, audit, settings (payments toggle)
  pharmacy/                           Public marketplace + product/[productId]
  pharmacy/order/[prescriptionId]     Patient → fulfilment order
  api/auth/[...nextauth]              NextAuth handlers
  api/files/[key]                     Authenticated file serving
  api/prescriptions/[id]/pdf          Prescription PDF (HMAC signature + QR)
  api/appointments/[id]/lab-request   Lab request PDF (decrypted on the fly)
  api/appointments/[id]/invoice       Insurance invoice PDF (superbill)
  api/webhooks/stripe                 Checkout / payment events
  actions/lab.ts                      saveLabRequestsAction (doctor only)
  actions/                            Other server actions

lib/
  db.ts          crypto.ts            AES-256-GCM PHI + HMAC-SHA256 Rx
  authz.ts       audit.ts
  email.ts       stripe.ts
  storage.ts     ratelimit.ts
  schemas.ts (zod)  env.ts (zod)
  models/                             Mongoose models
  pdf/PrescriptionPdf.tsx             ℞ Prescription (signed + QR)
  pdf/LabRequestPdf.tsx               Laboratory request order
  pdf/InvoicePdf.tsx                  Insurance superbill (CPT 99213, POS 02)

server.ts                             Custom Node server (Next + Socket.IO)
proxy.ts                              Role gating (Next 16 replaces middleware.ts)
auth.ts                               NextAuth v5 config
docs/                                 Product and design references
```

## Security model

- **PHI at rest.** Free-text clinical fields are stored as AES-256-GCM ciphertext keyed by `PHI_ENCRYPTION_KEY`. Field names ending in `Enc` are encrypted.
- **Prescription integrity.** Each Rx has an HMAC-SHA256 signature over its canonical payload, keyed by `PRESCRIPTION_HMAC_KEY`. The public `/verify/[token]` page recomputes and refuses tampered scripts.
- **Audit.** Append-only `AuditLog` collection. Never contains PHI.
- **Authz.** JWT sessions, `proxy.ts` does coarse role gating, and every Server Action / route re-checks via `requireRole()`.
- **Rate limiting.** Token bucket in `lib/ratelimit.ts`; falls back to Upstash Redis when configured.
- **CSP / security headers.** Set in `next.config.ts`.
- **No PHI in URLs, metadata, or logs.**

## Without external services

If `STRIPE_SECRET_KEY` is missing, booking and pharmacy flows skip Checkout and auto-confirm — handy for local development. Admins can also force payments off at runtime from `/dashboard/admin/settings` (same effect, no restart). SMTP-less environments log emails to stdout.

## Notes / known limits

- **Video consults don't work on Vercel.** Signalling runs on Socket.IO in `server.ts`, and Vercel doesn't run custom servers, so `/api/socket` returns 404 there. Everything else deploys normally. Consults need a host that runs `npm start` as a long-lived process.
- `simple-peer` needs a `process` shim under Turbopack. `app/consult/[appointmentId]/ProcessShim.tsx` provides it.
- Uploads go to local disk by default. Set `STORAGE_DRIVER=s3` on hosts without a persistent disk, such as Vercel.
- This is a portfolio implementation, not a real medical service.

