/**
 * One-shot patch: rename demo users, update patient phone, add Sexologist.
 * Run: npx tsx --env-file-if-exists=.env.local scripts/patch-rename-users.ts
 */
import bcrypt from "bcryptjs";
import { connectDB } from "../lib/db";
import { User } from "../lib/models/User";
import { DoctorProfile } from "../lib/models/DoctorProfile";
import { PatientProfile } from "../lib/models/PatientProfile";
import { encryptPHI } from "../lib/crypto";

import { Types } from "mongoose";

const RENAMES: Record<string, { name: string; phone?: string }> = {
  "patient@vellum.test":    { name: "Deepak Aeleni",        phone: "8885015899" },
  "doc.gp@vellum.test":     { name: "Pranav Mitta",          phone: "9966707911" },
  "doc.cardio@vellum.test": { name: "Satyaki Tirumal",       phone: "9949750581" },
  "doc.derm@vellum.test":   { name: "Nishal Karmasetty",     phone: "6302463674" },
  "doc.ortho@vellum.test":  { name: "Sanvi Vajnepalli",      phone: "7386757040" },
  "doc.peds@vellum.test":   { name: "Ankita Vemavarapu",     phone: "6304734167" },
  "doc.psych@vellum.test":  { name: "Rishi Pabbathi",        phone: "8143184369" },
  "doc.neuro@vellum.test":  { name: "Ankit Shankar",         phone: "9100132572" },
};

async function main() {
  await connectDB();

  // 1) Rename existing users
  for (const [email, { name }] of Object.entries(RENAMES)) {
    const res = await User.updateOne({ email }, { $set: { name } });
    console.log(`  ${email} → ${name}  (matched: ${res.matchedCount})`);
  }

  // 2) Update patient phone (PHI-encrypted)
  const patient = await User.findOne({ email: "patient@vellum.test" }).lean<{ _id: Types.ObjectId }>();
  if (patient) {
    await PatientProfile.updateOne(
      { user: patient._id },
      { $set: { phoneEnc: encryptPHI("+91 88850 15899") } },
      { upsert: true },
    );
    console.log("  patient phone updated (encrypted)");
  }

  // 3) Upsert new Sexologist doctor
  const sexoEmail = "doc.sexo@vellum.test";
  const existing = await User.findOne({ email: sexoEmail });
  if (!existing) {
    const passwordHash = await bcrypt.hash("password123", 12);
    const u = await User.create({
      email: sexoEmail,
      name: "Sushan Govardhanam",
      role: "doctor",
      passwordHash,
      status: "active",
    });
    await DoctorProfile.create({
      user: u._id,
      specialty: "Sexology",
      bio: "MD Sexology, AIIMS Hyderabad. Specialising in sexual health, fertility, and relationship counselling.",
      licenseNumber: "DEMO-DR-0008",
      licenseRegion: "TS",
      licenseVerifiedAt: new Date(),
      yearsOfExperience: 6,
      languages: ["English", "Telugu", "Hindi"],
      consultationFeeCents: 89900,
    });
    console.log("  doc.sexo@vellum.test created → Sushan Govardhanam (Sexology)");
  } else {
    await User.updateOne({ email: sexoEmail }, { $set: { name: "Sushan Govardhanam" } });
    console.log("  doc.sexo@vellum.test already exists — name confirmed");
  }

  console.log("✔ Patch complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
