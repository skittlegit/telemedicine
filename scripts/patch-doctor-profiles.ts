/**
 * Patch demo doctors: add ratings and proper Indian medical council licenses.
 * Run: npx tsx --env-file-if-exists=.env.local scripts/patch-doctor-profiles.ts
 */
import { Types } from "mongoose";
import { connectDB } from "../lib/db";
import { User } from "../lib/models/User";
import { DoctorProfile } from "../lib/models/DoctorProfile";

const PROFILES: Record<
  string,
  { licenseNumber: string; licenseRegion: string; rating: number; ratingCount: number }
> = {
  "doc.gp@vellum.test": {
    licenseNumber: "DMC/R/2012/18743",
    licenseRegion: "DL",
    rating: 4.7,
    ratingCount: 312,
  },
  "doc.cardio@vellum.test": {
    licenseNumber: "KMC/2010/52641",
    licenseRegion: "KA",
    rating: 4.9,
    ratingCount: 284,
  },
  "doc.derm@vellum.test": {
    licenseNumber: "MMC/2015/73908",
    licenseRegion: "MH",
    rating: 4.5,
    ratingCount: 196,
  },
  "doc.neuro@vellum.test": {
    licenseNumber: "TSNMC/2009/31024",
    licenseRegion: "TS",
    rating: 4.8,
    ratingCount: 241,
  },
  "doc.ortho@vellum.test": {
    licenseNumber: "GMC/2013/44817",
    licenseRegion: "GJ",
    rating: 4.6,
    ratingCount: 178,
  },
  "doc.peds@vellum.test": {
    licenseNumber: "TNMC/2016/60392",
    licenseRegion: "TN",
    rating: 4.8,
    ratingCount: 143,
  },
  "doc.psych@vellum.test": {
    licenseNumber: "KMC/Reg/2014/28956",
    licenseRegion: "KL",
    rating: 4.7,
    ratingCount: 209,
  },
  "doc.sexo@vellum.test": {
    licenseNumber: "TSNMC/2018/55127",
    licenseRegion: "TS",
    rating: 4.4,
    ratingCount: 87,
  },
};

async function main() {
  await connectDB();

  for (const [email, patch] of Object.entries(PROFILES)) {
    const user = await User.findOne({ email }).select("_id").lean<{ _id: Types.ObjectId }>();
    if (!user) {
      console.log(`  SKIP ${email} — user not found`);
      continue;
    }
    const res = await DoctorProfile.updateOne(
      { user: user._id },
      {
        $set: {
          licenseNumber: patch.licenseNumber,
          licenseRegion: patch.licenseRegion,
          rating: patch.rating,
          ratingCount: patch.ratingCount,
        },
      },
    );
    console.log(
      `  ${email} → ${patch.licenseNumber}  ★${patch.rating} (${patch.ratingCount} reviews)  matched:${res.matchedCount}`,
    );
  }

  console.log("✔ Doctor profile patch complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
