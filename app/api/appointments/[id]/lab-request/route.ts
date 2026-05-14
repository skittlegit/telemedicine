import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/lib/models/Appointment";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { User } from "@/lib/models/User";
import { decryptPHI } from "@/lib/crypto";
import { requireSession } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { LabRequestPdf } from "@/lib/pdf/LabRequestPdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ApptView {
  _id: string;
  doctor: { _id: string; name: string };
  patient: { _id: string; name: string };
  startAt: Date;
  labRequestsEnc?: string;
  reasonEnc?: string;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  const { id } = await context.params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await connectDB();
  void User;

  const appt = await Appointment.findById(id)
    .populate("doctor", "name")
    .populate("patient", "name")
    .lean<ApptView | null>();

  if (!appt) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!appt.labRequestsEnc) {
    return NextResponse.json({ error: "no lab request on this appointment" }, { status: 404 });
  }

  const me = session.user.id;
  const role = session.user.role;
  const allowed =
    String(appt.doctor._id) === me ||
    String(appt.patient._id) === me ||
    role === "admin";
  if (!allowed) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const docProfile = await DoctorProfile.findOne({ user: appt.doctor._id })
    .lean<{ licenseNumber: string; licenseRegion: string } | null>();

  const labRequests: Array<{ test: string; notes?: string }> = JSON.parse(
    decryptPHI(appt.labRequestsEnc) ?? "[]",
  );
  const reason = decryptPHI(appt.reasonEnc) ?? undefined;

  void audit({
    actor: me,
    actorRole: role,
    action: "lab.read_pdf",
    target: `Appointment:${id}`,
  });

  const pdf = await renderToBuffer(
    createElement(LabRequestPdf, {
      appointmentId: String(appt._id),
      doctorName: appt.doctor.name,
      licenseNumber: docProfile?.licenseNumber ?? "N/A",
      licenseRegion: docProfile?.licenseRegion ?? "",
      patientName: appt.patient.name,
      issuedAt: new Date(appt.startAt).toISOString(),
      labRequests,
      reason,
    }) as unknown as Parameters<typeof renderToBuffer>[0],
  );

  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="lab-request-${id}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
