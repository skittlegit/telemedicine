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
import { seedDemoData } from "./seed-demo-data";

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
    name: "Deepak Aeleni",
    role: "patient",
    password: "password123",
  });
  await PatientProfile.findOneAndUpdate(
    { user: patient._id },
    { user: patient._id },
    { upsert: true },
  );

  const docs = [
    { email: "doc.cardio@vellum.test", name: "Satyaki Tirumal", specialty: "Cardiology" },
    { email: "doc.gp@vellum.test", name: "Pranav Mitta", specialty: "General practice" },
    { email: "doc.derm@vellum.test", name: "Nishal Karmasetty", specialty: "Dermatology" },
    { email: "doc.neuro@vellum.test", name: "Ankit Shankar", specialty: "Neurology" },
    { email: "doc.ortho@vellum.test", name: "Sanvi Vajnepalli", specialty: "Orthopaedics" },
    { email: "doc.peds@vellum.test", name: "Ankita Vemavarapu", specialty: "Paediatrics" },
    { email: "doc.psych@vellum.test", name: "Rishi Pabbathi", specialty: "Psychiatry" },
    { email: "doc.sexo@vellum.test", name: "Sushan Govardhanam", specialty: "Sexology" },
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
        bio: `MBBS, MD – ${d.specialty}. Demo seed.`,
        licenseNumber: "DEMO-1234",
        licenseRegion: "IN",
        licenseVerifiedAt: new Date(),
        yearsOfExperience: 10,
        languages: ["English", "Hindi"],
        consultationFeeCents: 89900,
      },
      { upsert: true, new: true },
    );
  }

  // Seed pharmacies below — the individual rx-* accounts serve as pharmacist demo logins.
  // Mock dispensary network — verified pharmacies that patients can pick
  // from when sending a prescription for fulfilment.
  const pharmacies = [
    {
      email: "rx-1@vellum.test",
      name: "Apollo Medicals",
      city: "Mumbai",
      region: "MH",
      addressLine1: "14 Linking Road, Bandra West",
      postalCode: "400050",
      licenseNumber: "RX-2026-0001",
      phone: "+91 22 2655 0101",
    },
    {
      email: "rx-2@vellum.test",
      name: "MedPlus Pharmacy",
      city: "Bengaluru",
      region: "KA",
      addressLine1: "82 Brigade Road",
      postalCode: "560025",
      licenseNumber: "RX-2026-0002",
      phone: "+91 80 4112 0202",
    },
    {
      email: "rx-3@vellum.test",
      name: "Wellness Forever",
      city: "New Delhi",
      region: "DL",
      addressLine1: "C-12 Connaught Place",
      postalCode: "110001",
      licenseNumber: "RX-2026-0003",
      phone: "+91 11 4155 0303",
    },
    {
      email: "rx-4@vellum.test",
      name: "Netmeds Store",
      city: "Chennai",
      region: "TN",
      addressLine1: "45 Anna Salai",
      postalCode: "600002",
      licenseNumber: "RX-2026-0004",
      phone: "+91 44 2851 0404",
    },
    {
      email: "rx-5@vellum.test",
      name: "Medlink Pharmacy",
      city: "Hyderabad",
      region: "TS",
      addressLine1: "8 Banjara Hills Road No.12",
      postalCode: "500034",
      licenseNumber: "RX-2026-0005",
      phone: "+91 40 6677 0505",
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
        country: "IN",
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
    { email: "rx-5@vellum.test", name: "Metformin 500", generic: "Metformin", category: "rx", priceCents: 12900, stock: 100 },
    { email: "rx-5@vellum.test", name: "Azithromycin 250", generic: "Azithromycin", category: "rx", priceCents: 21900, stock: 80 },
    { email: "rx-5@vellum.test", name: "Antacid Syrup 200ml", generic: "Aluminium Hydroxide", category: "otc", priceCents: 8900, stock: 150 },
    { email: "rx-5@vellum.test", name: "Blood Pressure Monitor", generic: "BP Monitor", category: "devices", priceCents: 149900, stock: 30 },
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
      console.log("  prescription: demo Rx for Priya Mehta (orderable)");
    }
  }

  console.log("✔ Seed complete. Demo accounts (password: password123):");
  console.log("  patient@vellum.test  (Deepak Aeleni)");
  console.log("  doc.gp@vellum.test   (Pranav Mitta, General practice, Delhi)");
  console.log("  doc.cardio@vellum.test (Satyaki Tirumal, Cardiology, Bengaluru)");
  console.log("  doc.derm@vellum.test (Nishal Karmasetty, Dermatology, Mumbai)");
  console.log("  doc.neuro@vellum.test (Ankit Shankar, Neurology, Kerala)");
  console.log("  doc.ortho@vellum.test (Sanvi Vajnepalli, Orthopaedics, Gujarat)");
  console.log("  doc.peds@vellum.test (Ankita Vemavarapu, Paediatrics, Chennai)");
  console.log("  doc.psych@vellum.test (Rishi Pabbathi, Psychiatry, Kerala)");
  console.log("  doc.sexo@vellum.test (Sushan Govardhanam, Sexology, Hyderabad)");
  console.log("  rx-1@vellum.test     (Apollo Medicals, Mumbai)");
  console.log("  rx-2@vellum.test     (MedPlus Pharmacy, Bengaluru)");
  console.log("  rx-3@vellum.test     (Wellness Forever, New Delhi)");
  console.log("  rx-4@vellum.test     (Netmeds Store, Chennai)");
  console.log("  rx-5@vellum.test     (Medlink Pharmacy, Hyderabad)");
  console.log("  admin@vellum.test");

  // Seed rich visit / prescription / order demo data
  await seedDemoData();

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
