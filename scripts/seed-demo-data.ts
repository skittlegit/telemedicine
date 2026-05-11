/**
 * Seed rich demo data: past + upcoming visits, prescriptions, and pharmacy
 * orders in all status states.  Idempotent — checks for existing docs before
 * inserting.  Run via: npx tsx --env-file-if-exists=.env.local scripts/seed-demo-data.ts
 * (Also called by scripts/seed.ts after initial account setup.)
 */
import { randomBytes } from "crypto";
import { Types } from "mongoose";
import { connectDB } from "../lib/db";
import { User } from "../lib/models/User";
import { Appointment } from "../lib/models/Appointment";
import { Prescription } from "../lib/models/Prescription";
import { PharmacyOrder } from "../lib/models/PharmacyOrder";
import { encryptPHI, signPrescription } from "../lib/crypto";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000);
}
function daysAhead(n: number) {
  return new Date(Date.now() + n * 86_400_000);
}
function addMinutes(d: Date, m: number) {
  return new Date(d.getTime() + m * 60_000);
}

async function createAppt(opts: {
  patient: Types.ObjectId;
  doctor: Types.ObjectId;
  startAt: Date;
  status: "completed" | "scheduled" | "cancelled" | "no_show";
  reasonPlain: string;
  notesPlain?: string;
  feeCents?: number;
}) {
  const existing = await Appointment.findOne({
    patient: opts.patient,
    doctor: opts.doctor,
    startAt: opts.startAt,
  });
  if (existing) return existing;
  return Appointment.create({
    patient: opts.patient,
    doctor: opts.doctor,
    startAt: opts.startAt,
    endAt: addMinutes(opts.startAt, 30),
    durationMinutes: 30,
    status: opts.status,
    feeCents: opts.feeCents ?? 89900,
    reasonEnc: encryptPHI(opts.reasonPlain),
    notesEnc: opts.notesPlain ? encryptPHI(opts.notesPlain) : undefined,
    ...(opts.status === "completed"
      ? { startedAt: opts.startAt, endedAt: addMinutes(opts.startAt, 30) }
      : {}),
  });
}

async function createRx(opts: {
  appointmentId: Types.ObjectId;
  doctorId: Types.ObjectId;
  patientId: Types.ObjectId;
  diagnosisPlain: string;
  drugs: Array<{ name: string; dose: string; freq: string; days: number; notes?: string }>;
  issuedDaysAgo: number;
}) {
  const existing = await Prescription.findOne({
    appointment: opts.appointmentId,
  });
  if (existing) return existing;
  const _id = new Types.ObjectId();
  const issuedAt = daysAgo(opts.issuedDaysAgo);
  const verifyToken = randomBytes(16).toString("hex");
  const drugs = opts.drugs.map((d) => ({ ...d, notes: d.notes ?? "" }));
  const signature = signPrescription({
    id: String(_id),
    doctorId: String(opts.doctorId),
    patientId: String(opts.patientId),
    issuedAt: issuedAt.getTime(),
    drugs,
  });
  return Prescription.create({
    _id: _id as unknown as string,
    appointment: opts.appointmentId,
    doctor: opts.doctorId,
    patient: opts.patientId,
    drugs,
    diagnosisEnc: encryptPHI(opts.diagnosisPlain),
    issuedAt,
    signature,
    verifyToken,
  });
}

async function createOrder(opts: {
  kind: "rx" | "marketplace";
  patient: Types.ObjectId;
  pharmacy: Types.ObjectId;
  pharmacist: Types.ObjectId;
  prescriptionId?: Types.ObjectId;
  status: "queued" | "claimed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
  items: Array<{ productId: string; name: string; strength: string; qty: number; priceCents: number; pharmacyId: string }>;
  totalCents: number;
  daysAgoCreated: number;
}) {
  const existing = await PharmacyOrder.findOne({
    patient: opts.patient,
    pharmacy: opts.pharmacy,
    status: opts.status,
    totalCents: opts.totalCents,
  });
  if (existing) return existing;

  const createdAt = daysAgo(opts.daysAgoCreated);
  const paidAt = new Date(createdAt.getTime() + 10 * 60_000);
  const claimedAt = ["claimed", "preparing", "out_for_delivery", "delivered"].includes(opts.status)
    ? new Date(createdAt.getTime() + 2 * 3600_000)
    : undefined;
  const deliveredAt = opts.status === "delivered"
    ? new Date(createdAt.getTime() + 2 * 86_400_000)
    : undefined;

  return PharmacyOrder.create({
    kind: opts.kind,
    prescription: opts.prescriptionId,
    patient: opts.patient,
    pharmacy: opts.pharmacy,
    pharmacist: opts.pharmacist,
    status: opts.status,
    deliveryAddressEnc: encryptPHI("14 Green Park Lane, Mumbai MH 400001") ?? "",
    totalCents: opts.totalCents,
    items: opts.items,
    paymentIntentId: `pi_demo_${randomBytes(8).toString("hex")}`,
    paidAt,
    claimedAt,
    deliveredAt,
    notesEnc: encryptPHI("Demo order — seed data"),
    createdAt,
    updatedAt: deliveredAt ?? claimedAt ?? paidAt,
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export async function seedDemoData() {
  await connectDB();

  const patient = await User.findOne({ email: "patient@vellum.test" }).lean<{ _id: Types.ObjectId }>();
  if (!patient) {
    console.log("  demo-data: patient not found, skipping (run seed.ts first)");
    return;
  }

  const docEmails = [
    "doc.gp@vellum.test",
    "doc.cardio@vellum.test",
    "doc.derm@vellum.test",
    "doc.neuro@vellum.test",
    "doc.ortho@vellum.test",
    "doc.peds@vellum.test",
    "doc.psych@vellum.test",
    "doc.sexo@vellum.test",
  ];
  const doctors = await User.find({ email: { $in: docEmails } })
    .select("_id email")
    .lean<{ _id: Types.ObjectId; email: string }[]>();
  const docByEmail = new Map(doctors.map((d) => [d.email, d._id]));

  const rxEmails = [
    "rx-1@vellum.test",
    "rx-2@vellum.test",
    "rx-3@vellum.test",
    "rx-4@vellum.test",
    "rx-5@vellum.test",
  ];
  const pharmacists = await User.find({ email: { $in: rxEmails } })
    .select("_id email")
    .lean<{ _id: Types.ObjectId; email: string }[]>();
  const rxByEmail = new Map(pharmacists.map((p) => [p.email, p._id]));

  const pid = patient._id;

  // ─── PAST APPOINTMENTS + PRESCRIPTIONS ───────────────────────────────────

  const pastVisits: Array<{
    docEmail: string;
    daysAgo: number;
    reason: string;
    notes: string;
    diagnosis: string;
    drugs: Array<{ name: string; dose: string; freq: string; days: number; notes?: string }>;
  }> = [
    {
      docEmail: "doc.gp@vellum.test",
      daysAgo: 45,
      reason: "Persistent cough and mild fever for 4 days",
      notes: "Upper respiratory tract infection. Advised rest and hydration. Prescribed antibiotics.",
      diagnosis: "Acute pharyngitis with URTI",
      drugs: [
        { name: "Amoxicillin", dose: "500 mg", freq: "3× daily", days: 7 },
        { name: "Paracetamol", dose: "500 mg", freq: "as needed", days: 5, notes: "Max 4 doses/day" },
      ],
    },
    {
      docEmail: "doc.gp@vellum.test",
      daysAgo: 18,
      reason: "Annual health checkup",
      notes: "All vitals normal. BP 118/76, HR 72. Advised Vitamin D supplementation.",
      diagnosis: "Routine health maintenance",
      drugs: [
        { name: "Vitamin D3", dose: "1000 IU", freq: "Once daily", days: 90 },
      ],
    },
    {
      docEmail: "doc.cardio@vellum.test",
      daysAgo: 30,
      reason: "Occasional palpitations and mild breathlessness on exertion",
      notes: "ECG normal sinus rhythm. Echo showed mild LV diastolic dysfunction. Lifestyle modification advised.",
      diagnosis: "Mild diastolic dysfunction, Grade I",
      drugs: [
        { name: "Metoprolol", dose: "25 mg", freq: "Once daily", days: 30 },
        { name: "Aspirin", dose: "75 mg", freq: "Once daily", days: 30, notes: "After breakfast" },
      ],
    },
    {
      docEmail: "doc.cardio@vellum.test",
      daysAgo: 7,
      reason: "Follow-up after starting Metoprolol",
      notes: "Palpitations reduced significantly. BP 122/80. Continuing current regimen.",
      diagnosis: "Diastolic dysfunction — stable on beta-blocker",
      drugs: [
        { name: "Metoprolol", dose: "25 mg", freq: "Once daily", days: 60 },
      ],
    },
    {
      docEmail: "doc.derm@vellum.test",
      daysAgo: 21,
      reason: "Itchy rash on forearms, appeared 1 week ago",
      notes: "Eczematous dermatitis on bilateral forearms. Avoid identified triggers. Topical steroid prescribed.",
      diagnosis: "Atopic dermatitis, mild–moderate",
      drugs: [
        { name: "Hydrocortisone cream 1%", dose: "Apply thin layer", freq: "Twice daily", days: 14 },
        { name: "Cetirizine", dose: "10 mg", freq: "Once at bedtime", days: 14 },
      ],
    },
    {
      docEmail: "doc.neuro@vellum.test",
      daysAgo: 35,
      reason: "Recurrent headaches, predominantly right-sided",
      notes: "Migraine without aura. Triggers: stress and irregular sleep. Lifestyle changes discussed. Triptan prescribed for acute attacks.",
      diagnosis: "Migraine without aura",
      drugs: [
        { name: "Sumatriptan", dose: "50 mg", freq: "At onset of attack", days: 30, notes: "Max 2 doses/24h" },
        { name: "Propranolol", dose: "40 mg", freq: "Twice daily", days: 30, notes: "Prophylactic" },
      ],
    },
    {
      docEmail: "doc.ortho@vellum.test",
      daysAgo: 28,
      reason: "Left knee pain after jogging, swelling",
      notes: "Mild patellofemoral syndrome. X-ray NAD. RICE advised. Physiotherapy recommended.",
      diagnosis: "Patellofemoral pain syndrome, left knee",
      drugs: [
        { name: "Diclofenac gel 1%", dose: "Apply to knee", freq: "3× daily", days: 10 },
        { name: "Ibuprofen", dose: "400 mg", freq: "Twice daily after meals", days: 7 },
      ],
    },
    {
      docEmail: "doc.peds@vellum.test",
      daysAgo: 14,
      reason: "Child with ear pain and mild fever — brought by parent (Priya)",
      notes: "Acute otitis media, right ear. Tympanic membrane erythematous. Prescribed antibiotics.",
      diagnosis: "Acute otitis media",
      drugs: [
        { name: "Amoxicillin-Clavulanate", dose: "250/62.5 mg", freq: "3× daily", days: 7 },
        { name: "Paracetamol syrup", dose: "250 mg/5 ml", freq: "Every 6 hours as needed", days: 5 },
      ],
    },
    {
      docEmail: "doc.psych@vellum.test",
      daysAgo: 40,
      reason: "Persistent low mood, fatigue, difficulty concentrating for 6 weeks",
      notes: "Meets criteria for moderate depressive episode. PHQ-9 score 14. Started SSRI and scheduled follow-up.",
      diagnosis: "Moderate depressive episode (ICD-10 F32.1)",
      drugs: [
        { name: "Escitalopram", dose: "10 mg", freq: "Once daily mornings", days: 30, notes: "Review in 4 weeks" },
      ],
    },
    {
      docEmail: "doc.psych@vellum.test",
      daysAgo: 10,
      reason: "Follow-up — SSRI review",
      notes: "PHQ-9 score improved to 9. Tolerating medication well. Dose maintained. CBT referral initiated.",
      diagnosis: "Improving depressive episode on escitalopram",
      drugs: [
        { name: "Escitalopram", dose: "10 mg", freq: "Once daily mornings", days: 60 },
      ],
    },
  ];

  // ─── UPCOMING APPOINTMENTS ───────────────────────────────────────────────
  const upcomingVisits: Array<{
    docEmail: string;
    daysAhead: number;
    hour: number;
    reason: string;
  }> = [
    { docEmail: "doc.gp@vellum.test",    daysAhead: 8,  hour: 10, reason: "Blood test results review" },
    { docEmail: "doc.cardio@vellum.test", daysAhead: 9,  hour: 11, reason: "Routine cardiac follow-up — 2-month check" },
    { docEmail: "doc.derm@vellum.test",   daysAhead: 10, hour: 14, reason: "Eczema follow-up, check healing" },
    { docEmail: "doc.neuro@vellum.test",  daysAhead: 7,  hour: 9,  reason: "Migraine diary review, 1-month prophylaxis assessment" },
    { docEmail: "doc.ortho@vellum.test",  daysAhead: 11, hour: 15, reason: "Knee physiotherapy progress review" },
    { docEmail: "doc.peds@vellum.test",   daysAhead: 8,  hour: 16, reason: "Post-AOM follow-up, hearing check" },
    { docEmail: "doc.psych@vellum.test",  daysAhead: 7,  hour: 13, reason: "Monthly psychiatric review, 2-month escitalopram" },
  ];

  const createdRxList: Types.ObjectId[] = [];

  // Seed past visits + Rxs
  for (const v of pastVisits) {
    const docId = docByEmail.get(v.docEmail);
    if (!docId) continue;
    const startAt = daysAgo(v.daysAgo);
    startAt.setHours(10, 0, 0, 0);
    const appt = await createAppt({
      patient: pid,
      doctor: docId,
      startAt,
      status: "completed",
      reasonPlain: v.reason,
      notesPlain: v.notes,
    });
    const rx = await createRx({
      appointmentId: appt._id as unknown as Types.ObjectId,
      doctorId: docId,
      patientId: pid,
      diagnosisPlain: v.diagnosis,
      drugs: v.drugs,
      issuedDaysAgo: v.daysAgo,
    });
    createdRxList.push(rx._id as unknown as Types.ObjectId);
  }

  // A few extra past statuses per doctor
  const extraPast: Array<{ docEmail: string; daysAgo: number; status: "cancelled" | "no_show"; reason: string }> = [
    { docEmail: "doc.gp@vellum.test",    daysAgo: 60, status: "cancelled", reason: "Schedule conflict — rescheduled" },
    { docEmail: "doc.cardio@vellum.test", daysAgo: 55, status: "no_show",   reason: "Initial consultation" },
    { docEmail: "doc.neuro@vellum.test",  daysAgo: 50, status: "cancelled", reason: "Could not attend" },
  ];
  for (const e of extraPast) {
    const docId = docByEmail.get(e.docEmail);
    if (!docId) continue;
    const startAt = daysAgo(e.daysAgo);
    startAt.setHours(15, 0, 0, 0);
    await createAppt({ patient: pid, doctor: docId, startAt, status: e.status, reasonPlain: e.reason });
  }

  // Seed upcoming visits
  for (const v of upcomingVisits) {
    const docId = docByEmail.get(v.docEmail);
    if (!docId) continue;
    const startAt = daysAhead(v.daysAhead);
    startAt.setHours(v.hour, 0, 0, 0);
    await createAppt({ patient: pid, doctor: docId, startAt, status: "scheduled", reasonPlain: v.reason });
  }

  console.log(`  demo-data: ${pastVisits.length} past visits, ${upcomingVisits.length} upcoming visits`);
  console.log(`  demo-data: ${pastVisits.length} prescriptions`);

  // ─── PHARMACY ORDERS ──────────────────────────────────────────────────────
  // Build a map of pharmacy User _id → {id, email, name}
  const rx1 = rxByEmail.get("rx-1@vellum.test")!;
  const rx2 = rxByEmail.get("rx-2@vellum.test")!;
  const rx3 = rxByEmail.get("rx-3@vellum.test")!;
  const rx4 = rxByEmail.get("rx-4@vellum.test")!;
  const rx5 = rxByEmail.get("rx-5@vellum.test")!;

  // Helper: pharmacy _id → string for productId/pharmacyId fields
  const s = (id: Types.ObjectId) => String(id);

  const orders: Array<Parameters<typeof createOrder>[0]> = [
    // ── rx-1 Apollo Medicals ─────────────────────────────────────
    {
      kind: "marketplace",
      patient: pid,
      pharmacy: rx1,
      pharmacist: rx1,
      status: "delivered",
      daysAgoCreated: 42,
      totalCents: 64700,
      items: [
        { productId: s(rx1) + "-P500", name: "Paracetamol 500", strength: "500 mg", qty: 2, priceCents: 4900, pharmacyId: s(rx1) },
        { productId: s(rx1) + "-VD3",  name: "Vitamin D3 1000IU", strength: "1000 IU", qty: 1, priceCents: 39900, pharmacyId: s(rx1) },
        { productId: s(rx1) + "-IBU",  name: "Ibuprofen 400", strength: "400 mg", qty: 2, priceCents: 6900, pharmacyId: s(rx1) },
      ],
    },
    {
      kind: "marketplace",
      patient: pid,
      pharmacy: rx1,
      pharmacist: rx1,
      status: "delivered",
      daysAgoCreated: 20,
      totalCents: 18900,
      items: [
        { productId: s(rx1) + "-AMX", name: "Amoxicillin 500", strength: "500 mg", qty: 1, priceCents: 18900, pharmacyId: s(rx1) },
      ],
    },
    {
      kind: "rx",
      patient: pid,
      pharmacy: rx1,
      pharmacist: rx1,
      prescriptionId: createdRxList[0],
      status: "delivered",
      daysAgoCreated: 44,
      totalCents: 25700,
      items: [
        { productId: s(rx1) + "-AMX", name: "Amoxicillin 500", strength: "500 mg", qty: 1, priceCents: 18900, pharmacyId: s(rx1) },
        { productId: s(rx1) + "-P500", name: "Paracetamol 500", strength: "500 mg", qty: 1, priceCents: 4900, pharmacyId: s(rx1) },
      ],
    },

    // ── rx-2 MedPlus Pharmacy ─────────────────────────────────────
    {
      kind: "marketplace",
      patient: pid,
      pharmacy: rx2,
      pharmacist: rx2,
      status: "out_for_delivery",
      daysAgoCreated: 1,
      totalCents: 119800,
      items: [
        { productId: s(rx2) + "-DIGT", name: "Digital Thermometer", strength: "", qty: 1, priceCents: 49900, pharmacyId: s(rx2) },
        { productId: s(rx2) + "-MULT", name: "Multivitamin Daily", strength: "", qty: 1, priceCents: 59900, pharmacyId: s(rx2) },
      ],
    },
    {
      kind: "marketplace",
      patient: pid,
      pharmacy: rx2,
      pharmacist: rx2,
      status: "delivered",
      daysAgoCreated: 29,
      totalCents: 5900,
      items: [
        { productId: s(rx2) + "-CET", name: "Cetirizine 10", strength: "10 mg", qty: 1, priceCents: 5900, pharmacyId: s(rx2) },
      ],
    },
    {
      kind: "rx",
      patient: pid,
      pharmacy: rx2,
      pharmacist: rx2,
      prescriptionId: createdRxList[2],
      status: "preparing",
      daysAgoCreated: 2,
      totalCents: 14900,
      items: [
        { productId: s(rx2) + "-OMP", name: "Omeprazole 20", strength: "20 mg", qty: 1, priceCents: 14900, pharmacyId: s(rx2) },
      ],
    },

    // ── rx-3 Wellness Forever ─────────────────────────────────────
    {
      kind: "marketplace",
      patient: pid,
      pharmacy: rx3,
      pharmacist: rx3,
      status: "delivered",
      daysAgoCreated: 38,
      totalCents: 9900,
      items: [
        { productId: s(rx3) + "-BND", name: "Adhesive Bandages", strength: "", qty: 1, priceCents: 9900, pharmacyId: s(rx3) },
      ],
    },
    {
      kind: "rx",
      patient: pid,
      pharmacy: rx3,
      pharmacist: rx3,
      prescriptionId: createdRxList[5],
      status: "claimed",
      daysAgoCreated: 3,
      totalCents: 11900,
      items: [
        { productId: s(rx3) + "-LVT", name: "Levothyroxine 50", strength: "50 mcg", qty: 1, priceCents: 11900, pharmacyId: s(rx3) },
      ],
    },
    {
      kind: "marketplace",
      patient: pid,
      pharmacy: rx3,
      pharmacist: rx3,
      status: "cancelled",
      daysAgoCreated: 12,
      totalCents: 129900,
      items: [
        { productId: s(rx3) + "-INS", name: "Insulin Glargine", strength: "100 IU/mL", qty: 1, priceCents: 129900, pharmacyId: s(rx3) },
      ],
    },

    // ── rx-4 Netmeds Store ────────────────────────────────────────
    {
      kind: "marketplace",
      patient: pid,
      pharmacy: rx4,
      pharmacist: rx4,
      status: "delivered",
      daysAgoCreated: 25,
      totalCents: 119900,
      items: [
        { productId: s(rx4) + "-POX", name: "Pulse Oximeter", strength: "", qty: 1, priceCents: 119900, pharmacyId: s(rx4) },
      ],
    },
    {
      kind: "rx",
      patient: pid,
      pharmacy: rx4,
      pharmacist: rx4,
      prescriptionId: createdRxList[3],
      status: "delivered",
      daysAgoCreated: 33,
      totalCents: 24900,
      items: [
        { productId: s(rx4) + "-SAL", name: "Salbutamol Inhaler", strength: "100 mcg/dose", qty: 1, priceCents: 24900, pharmacyId: s(rx4) },
      ],
    },
    {
      kind: "marketplace",
      patient: pid,
      pharmacy: rx4,
      pharmacist: rx4,
      status: "queued",
      daysAgoCreated: 0,
      totalCents: 129800,
      items: [
        { productId: s(rx4) + "-FAK", name: "First Aid Kit", strength: "", qty: 1, priceCents: 79900, pharmacyId: s(rx4) },
        { productId: s(rx4) + "-MAG", name: "Magnesium Glycinate", strength: "400 mg", qty: 1, priceCents: 49900, pharmacyId: s(rx4) },
      ],
    },

    // ── rx-5 Medlink Pharmacy ─────────────────────────────────────
    {
      kind: "rx",
      patient: pid,
      pharmacy: rx5,
      pharmacist: rx5,
      prescriptionId: createdRxList[7],
      status: "delivered",
      daysAgoCreated: 13,
      totalCents: 12900,
      items: [
        { productId: s(rx5) + "-MET", name: "Metformin 500", strength: "500 mg", qty: 1, priceCents: 12900, pharmacyId: s(rx5) },
      ],
    },
    {
      kind: "marketplace",
      patient: pid,
      pharmacy: rx5,
      pharmacist: rx5,
      status: "out_for_delivery",
      daysAgoCreated: 1,
      totalCents: 21900,
      items: [
        { productId: s(rx5) + "-AZI", name: "Azithromycin 250", strength: "250 mg", qty: 1, priceCents: 21900, pharmacyId: s(rx5) },
      ],
    },
    {
      kind: "marketplace",
      patient: pid,
      pharmacy: rx5,
      pharmacist: rx5,
      status: "queued",
      daysAgoCreated: 0,
      totalCents: 158800,
      items: [
        { productId: s(rx5) + "-BP",  name: "Blood Pressure Monitor", strength: "", qty: 1, priceCents: 149900, pharmacyId: s(rx5) },
        { productId: s(rx5) + "-ANT", name: "Antacid Syrup 200ml", strength: "200 ml", qty: 1, priceCents: 8900, pharmacyId: s(rx5) },
      ],
    },
  ];

  let orderCount = 0;
  for (const o of orders) {
    if (!o.pharmacy || !o.pharmacist) continue;
    await createOrder(o);
    orderCount++;
  }

  console.log(`  demo-data: ${orderCount} pharmacy orders across all 5 dispensaries`);
}

// Allow running standalone
if (require.main === module) {
  seedDemoData()
    .then(() => {
      console.log("✔ Demo data seeded.");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
