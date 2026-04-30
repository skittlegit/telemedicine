/**
 * Seed a few demo accounts and doctor profiles. Idempotent.
 * Run: `npm run seed` (loads .env.local automatically)
 */
import bcrypt from "bcryptjs";
import { connectDB } from "../lib/db";
import { User } from "../lib/models/User";
import { DoctorProfile } from "../lib/models/DoctorProfile";
import { PatientProfile } from "../lib/models/PatientProfile";

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
        consultationFeeCents: 5000,
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

  await upsertUser({
    email: "admin@vellum.test",
    name: "Ada Admin",
    role: "admin",
    password: "password123",
  });

  console.log("✔ Seed complete. Demo accounts (password: password123):");
  console.log("  patient@vellum.test");
  console.log("  doc.cardio@vellum.test, doc.gp@vellum.test, doc.derm@vellum.test");
  console.log("  pharmacist@vellum.test");
  console.log("  admin@vellum.test");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
