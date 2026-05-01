import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/lib/models/Appointment";
import { User } from "@/lib/models/User";
import { decryptPHI } from "@/lib/crypto";
import { requireSession } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { ConsultRoom } from "./ConsultRoom";
import { ProcessShim } from "./ProcessShim";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ appointmentId: string }>;
}

interface ApptView {
  _id: string;
  patient: { _id: string; name: string };
  doctor: { _id: string; name: string };
  startAt: Date;
  endAt: Date;
  status: string;
  reasonEnc?: string;
  roomId: string;
}

export default async function ConsultPage({ params }: PageProps) {
  const session = await requireSession();
  const { appointmentId } = await params;
  if (!Types.ObjectId.isValid(appointmentId)) notFound();

  await connectDB();
  void User;

  const appt = await Appointment.findById(appointmentId)
    .populate("patient", "name")
    .populate("doctor", "name")
    .lean<ApptView | null>();

  if (!appt) notFound();

  const me = session.user.id;
  const isParticipant =
    String(appt.patient._id) === me || String(appt.doctor._id) === me;
  if (!isParticipant) notFound();

  if (!["scheduled", "in_progress"].includes(appt.status)) {
    return (
      <main className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="eyebrow">Consultation</p>
          <h1 className="font-display text-4xl tracking-tight mt-3">Not available</h1>
          <p className="text-ink-soft mt-3">
            This appointment is currently <strong>{appt.status}</strong>.
          </p>
          <Link href="/dashboard" className="btn btn-ghost mt-6">← Dashboard</Link>
        </div>
      </main>
    );
  }

  const role = session.user.role;
  let reason: string | null = null;
  if (role === "doctor" && appt.reasonEnc) {
    reason = decryptPHI(appt.reasonEnc);
    void audit({
      actor: session.user.id,
      actorRole: role,
      action: "appointment.read_reason",
      target: `Appointment:${appt._id}`,
    });
  }
  const peerName =
    role === "doctor" ? appt.patient.name : `Dr. ${appt.doctor.name}`;

  return (
    <>
      <ProcessShim />
      <ConsultRoom
        appointmentId={String(appt._id)}
        roomId={appt.roomId}
        peerName={peerName}
        role={role}
        reason={reason}
        stunUrls={env.NEXT_PUBLIC_STUN_URLS}
        socketPath={env.SOCKET_PATH}
      />
    </>
  );
}
