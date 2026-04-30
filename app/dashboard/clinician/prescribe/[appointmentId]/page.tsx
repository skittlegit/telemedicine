import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/lib/models/Appointment";
import { User } from "@/lib/models/User";
import { decryptPHI } from "@/lib/crypto";
import { requireRole } from "@/lib/authz";
import { PrescribeForm } from "./PrescribeForm";
import { DashboardHeader } from "@/app/dashboard/_components/Shell";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ appointmentId: string }>;
}

interface ApptView {
  _id: string;
  doctor: string;
  patient: { _id: string; name: string };
  reasonEnc?: string;
  status: string;
  startAt: Date;
}

export default async function PrescribePage({ params }: PageProps) {
  const session = await requireRole("doctor");
  const { appointmentId } = await params;
  if (!Types.ObjectId.isValid(appointmentId)) notFound();

  await connectDB();
  void User;
  const appt = await Appointment.findById(appointmentId)
    .populate("patient", "name")
    .lean<ApptView | null>();
  if (!appt) notFound();
  if (String(appt.doctor) !== session.user.id) notFound();

  return (
    <main className="min-h-screen bg-paper text-ink">
      <DashboardHeader user={{ name: session.user.name ?? "Doctor", role: "doctor" }} />
      <div className="mx-auto w-full max-w-[720px] px-6 lg:px-8 py-12">
        <Link href="/dashboard" className="eyebrow text-ink-mute hover:text-clay">
          ← Dashboard
        </Link>
        <h1 className="font-display text-5xl tracking-tight mt-4">Issue prescription</h1>
        <p className="text-ink-soft mt-2">
          For <strong>{appt.patient.name}</strong> · {new Date(appt.startAt).toLocaleString()}
        </p>
        {appt.reasonEnc && (
          <div className="mt-6 border border-[color:var(--rule)] p-3 text-sm">
            <p className="eyebrow mb-1">Patient&apos;s reason</p>
            <p className="text-ink-soft">{decryptPHI(appt.reasonEnc)}</p>
          </div>
        )}

        <PrescribeForm appointmentId={String(appt._id)} />
      </div>
    </main>
  );
}
