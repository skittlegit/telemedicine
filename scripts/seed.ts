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
    { email: "doc.gp@vellum.test", name: "Ben Stone", specialty: "General Practice" },
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
