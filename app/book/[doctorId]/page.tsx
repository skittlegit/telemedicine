import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { User } from "@/lib/models/User";
import { requireRole } from "@/lib/authz";
import { BookForm } from "./BookForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ doctorId: string }>;
}

interface DoctorRow {
  _id: string;
  consultationFeeCents: number;
  specialty: string;
  user: { _id: string; name: string };
}

export default async function BookPage({ params }: PageProps) {
  await requireRole("patient");
  const { doctorId } = await params;
  if (!Types.ObjectId.isValid(doctorId)) notFound();

  await connectDB();
  void User;
  const doc = await DoctorProfile.findById(doctorId)
    .populate("user", "name")
    .lean<DoctorRow | null>();
  if (!doc || !doc.user) notFound();

  // First available slot: tomorrow at 10:00 local time.
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto w-full max-w-[640px] px-8 py-12">
        <Link href={`/doctors/${doc._id}`} className="eyebrow text-ink-mute hover:text-clay">
          ← Back
        </Link>
        <h1 className="font-display text-5xl tracking-tight mt-4">Book a consultation</h1>
        <p className="text-ink-soft mt-2">
          With <strong>Dr. {doc.user.name}</strong> · {doc.specialty}
        </p>
        <p className="mono text-sm text-ink-mute mt-1">
          Fee: ${(doc.consultationFeeCents / 100).toFixed(2)} · 30 minutes
        </p>

        <BookForm
          doctorId={doc._id}
          defaultStartAt={tomorrow.toISOString().slice(0, 16)}
        />
      </div>
    </main>
  );
}
