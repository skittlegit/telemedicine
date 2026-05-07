/**
 * Seed a few demo accounts and doctor profiles. Idempotent.
 * Run: `npm run seed` (loads .env.local automatically)
 */
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { connectDB } from "../lib/db";
import { User } from "../lib/models/User";
import { DoctorProfile } from "../lib/models/DoctorProfile";
import { PatientProfile } from "../lib/models/PatientProfile";
import { PharmacyProfile } from "../lib/models/PharmacyProfile";
import { PharmacyListing } from "../lib/models/PharmacyListing";
import { Appointment } from "../lib/models/Appointment";
import { Prescription } from "../lib/models/Prescription";
import { signPrescription } from "../lib/crypto";

async function upsertUser(opts: {
  email: string;
  name: string;
  role: "patient" | "doctor" | "pharmacist" | "admin";
  password: string;
}) {
  const existing = await User.findOne({ email: opts.email });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(opts.password, 12);
  return User.create({
    email: opts.email,
    name: opts.name,
    role: opts.role,
    passwordHash,
    status: "active",
  });
}

async function main() {
  await connectDB();

  const patient = await upsertUser({
    email: "patient@vellum.test",
    name: "Eve Patient",
    role: "patient",
    password: "password123",
  });
  await PatientProfile.findOneAndUpdate(
    { user: patient._id },
    { user: patient._id },
    { upsert: true },
  );

  const docs = [
    { email: "doc.cardio@vellum.test", name: "Alice Heart", specialty: "Cardiology" },
    { email: "doc.gp@vellum.test", name: "Ben Stone", specialty: "General practice" },
    { email: "doc.derm@vellum.test", name: "Cara Skin", specialty: "Dermatology" },
  ];
  for (const d of docs) {
    const u = await upsertUser({
      email: d.email,
      name: d.name,
      role: "doctor",
      password: "password123",
    });
    await DoctorProfile.findOneAndUpdate(
      { user: u._id },
      {
        user: u._id,
        specialty: d.specialty,
        bio: `Board-certified in ${d.specialty}. Demo seed.`,
        licenseNumber: "DEMO-1234",
        licenseRegion: "DEMO",
        licenseVerifiedAt: new Date(),
        yearsOfExperience: 10,
        languages: ["English"],
        consultationFeeCents: 89900,
      },
      { upsert: true, new: true },
    );
  }

  await upsertUser({
    email: "pharmacist@vellum.test",
    name: "Pat Pharmacy",
    role: "pharmacist",
    password: "password123",
  });

  // Mock dispensary network — verified pharmacies that patients can pick
  // from when sending a prescription for fulfilment.
  const pharmacies = [
    {
      email: "rx-1@vellum.test",
      name: "Dovetail Pharmacy",
      city: "Brooklyn",
      region: "NY",
      addressLine1: "212 Smith Street",
      postalCode: "11231",
      licenseNumber: "RX-2026-0001",
      phone: "+1 718 555 0101",
    },
    {
      email: "rx-2@vellum.test",
      name: "Cedar Apothecary",
      city: "Austin",
      region: "TX",
      addressLine1: "1108 East Cesar Chavez St",
      postalCode: "78702",
      licenseNumber: "RX-2026-0002",
      phone: "+1 512 555 0102",
    },
    {
      email: "rx-3@vellum.test",
      name: "Riverside Rx",
      city: "Portland",
      region: "OR",
      addressLine1: "4140 SE Hawthorne Blvd",
      postalCode: "97214",
      licenseNumber: "RX-2026-0003",
      phone: "+1 503 555 0103",
    },
    {
      email: "rx-4@vellum.test",
      name: "Lantern Pharmacy",
      city: "Cambridge",
      region: "MA",
      addressLine1: "1320 Massachusetts Ave",
      postalCode: "02138",
      licenseNumber: "RX-2026-0004",
      phone: "+1 617 555 0104",
    },
  ];
  for (const p of pharmacies) {
    const u = await upsertUser({
      email: p.email,
      name: p.name,
      role: "pharmacist",
      password: "password123",
    });
    await PharmacyProfile.findOneAndUpdate(
      { user: u._id },
      {
        user: u._id,
        pharmacyName: p.name,
        licenseNumber: p.licenseNumber,
        licenseRegion: p.region,
        licenseVerifiedAt: new Date(),
        addressLine1: p.addressLine1,
        city: p.city,
        region: p.region,
        postalCode: p.postalCode,
        country: "US",
        phone: p.phone,
      },
      { upsert: true, new: true },
    );
    console.log(`  pharmacy: ${p.name} (${p.city}, ${p.region}) → ${u._id}`);
  }

  // Marketplace listings — a small but realistic catalog spread across the
  // four pharmacies. Idempotent: skipped when the listing name already
  // exists for that pharmacy.
  const pharmacyUsers = await User.find({ role: "pharmacist" })
    .select("_id email")
    .lean<{ _id: import("mongoose").Types.ObjectId; email: string }[]>();
  const byEmail = new Map(pharmacyUsers.map((u) => [u.email, u._id]));
  const catalog: Array<{
    email: string;
    name: string;
    generic: string;
    category: "otc" | "rx" | "wellness" | "devices" | "first-aid" | "cold-chain";
    priceCents: number;
    stock: number;
  }> = [
    { email: "rx-1@vellum.test", name: "Paracetamol 500", generic: "Paracetamol", category: "otc", priceCents: 4900, stock: 240 },
    { email: "rx-1@vellum.test", name: "Ibuprofen 400", generic: "Ibuprofen", category: "otc", priceCents: 6900, stock: 180 },
    { email: "rx-1@vellum.test", name: "Amoxicillin 500", generic: "Amoxicillin", category: "rx", priceCents: 18900, stock: 60 },
    { email: "rx-1@vellum.test", name: "Vitamin D3 1000IU", generic: "Cholecalciferol", category: "wellness", priceCents: 39900, stock: 120 },
    { email: "rx-2@vellum.test", name: "Omeprazole 20", generic: "Omeprazole", category: "rx", priceCents: 14900, stock: 80 },
    { email: "rx-2@vellum.test", name: "Cetirizine 10", generic: "Cetirizine", category: "otc", priceCents: 5900, stock: 200 },
    { email: "rx-2@vellum.test", name: "Digital Thermometer", generic: "Thermometer", category: "devices", priceCents: 49900, stock: 35 },
    { email: "rx-2@vellum.test", name: "Multivitamin Daily", generic: "Multivitamin", category: "wellness", priceCents: 59900, stock: 150 },
    { email: "rx-3@vellum.test", name: "Insulin Glargine", generic: "Insulin Glargine", category: "cold-chain", priceCents: 129900, stock: 20 },
    { email: "rx-3@vellum.test", name: "Adhesive Bandages", generic: "Bandages", category: "first-aid", priceCents: 9900, stock: 300 },
    { email: "rx-3@vellum.test", name: "Levothyroxine 50", generic: "Levothyroxine", category: "rx", priceCents: 11900, stock: 90 },
    { email: "rx-4@vellum.test", name: "Pulse Oximeter", generic: "SpO2 Monitor", category: "devices", priceCents: 119900, stock: 40 },
    { email: "rx-4@vellum.test", name: "Salbutamol Inhaler", generic: "Salbutamol", category: "rx", priceCents: 24900, stock: 70 },
    { email: "rx-4@vellum.test", name: "Magnesium Glycinate", generic: "Magnesium", category: "wellness", priceCents: 49900, stock: 110 },
    { email: "rx-4@vellum.test", name: "First Aid Kit", generic: "First Aid Kit", category: "first-aid", priceCents: 79900, stock: 50 },
  ];
  for (const item of catalog) {
    const ownerId = byEmail.get(item.email);
    if (!ownerId) continue;
    const exists = await PharmacyListing.findOne({
      pharmacy: ownerId,
      name: item.name,
    });
    if (exists) continue;
    await PharmacyListing.create({
      pharmacy: ownerId,
      name: item.name,
      generic: item.generic,
      category: item.category,
      priceCents: item.priceCents,
      stock: item.stock,
      active: true,
    });
  }
  console.log(`  listings: ${catalog.length} marketplace items seeded`);

  await upsertUser({
    email: "admin@vellum.test",
    name: "Ada Admin",
    role: "admin",
    password: "password123",
  });

  // Demo prescription so the order flow is testable end-to-end without
  // needing a clinician to issue one. Idempotent: skips if any active
  // prescription already exists for the demo patient.
  const existingRx = await Prescription.findOne({
    patient: patient._id,
    revokedAt: null,
    fulfilledAt: null,
  });
  if (!existingRx) {
    const gp = await User.findOne({ email: "doc.gp@vellum.test" });
    if (gp) {
      const start = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const appt = await Appointment.create({
        patient: patient._id,
        doctor: gp._id,
        startAt: start,
        endAt: new Date(start.getTime() + 30 * 60 * 1000),
        status: "completed",
        feeCents: 89900,
      });
      const drugs = [
        { name: "Amoxicillin", dose: "500 mg", freq: "3× daily", days: 7, notes: "" },
        { name: "Ibuprofen", dose: "400 mg", freq: "as needed", days: 5, notes: "With food" },
      ];
      const issuedAt = new Date();
      const verifyToken = randomBytes(16).toString("hex");
      // Mongo will assign _id; pre-compute via ObjectId so we can sign.
      const { Types } = await import("mongoose");
      const _id = new Types.ObjectId();
      const signature = signPrescription({
        id: String(_id),
        doctorId: String(gp._id),
        patientId: String(patient._id),
        issuedAt: issuedAt.getTime(),
        drugs,
      });
      await Prescription.create({
        _id: _id as unknown as string,
        appointment: appt._id,
        doctor: gp._id,
        patient: patient._id,
        drugs,
        issuedAt,
        signature,
        verifyToken,
      });
      console.log("  prescription: demo Rx for Eve Patient (orderable)");
    }
  }

  console.log("✔ Seed complete. Demo accounts (password: password123):");
  console.log("  patient@vellum.test");
  console.log("  doc.cardio@vellum.test, doc.gp@vellum.test, doc.derm@vellum.test");
  console.log("  pharmacist@vellum.test");
  console.log("  rx-1..4@vellum.test (4 verified pharmacies)");
  console.log("  admin@vellum.test");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
