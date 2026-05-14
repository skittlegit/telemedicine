import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/lib/models/Appointment";
import { Prescription } from "@/lib/models/Prescription";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { PatientProfile } from "@/lib/models/PatientProfile";
import { User } from "@/lib/models/User";
import { decryptPHI } from "@/lib/crypto";
import { requireSession } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { InvoicePdf } from "@/lib/pdf/InvoicePdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ApptView {
  _id: string;
  doctor: { _id: string; name: string };
  patient: { _id: string; name: string };
  startAt: Date;
  feeCents: number;
  status: string;
  notesEnc?: string;
}

interface RxView {
  diagnosisEnc?: string;
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

  const me = session.user.id;
  const role = session.user.role;
  const allowed =
    String(appt.patient._id) === me ||
    String(appt.doctor._id) === me ||
    role === "admin";
  if (!allowed) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const [docProfile, patProfile, rx] = await Promise.all([
    DoctorProfile.findOne({ user: appt.doctor._id })
      .lean<{ licenseNumber: string; licenseRegion: string; specialty: string } | null>(),
    PatientProfile.findOne({ user: appt.patient._id })
      .lean<{ dobEnc?: string; insuranceEnc?: string } | null>(),
    Prescription.findOne({ appointment: appt._id })
      .lean<RxView | null>(),
  ]);

  const patientDob = patProfile?.dobEnc ? decryptPHI(patProfile.dobEnc) ?? undefined : undefined;
  const patientInsurance = patProfile?.insuranceEnc
    ? decryptPHI(patProfile.insuranceEnc) ?? undefined
    : undefined;
  const diagnosis =
    rx?.diagnosisEnc ? decryptPHI(rx.diagnosisEnc) ?? undefined :
    appt.notesEnc ? decryptPHI(appt.notesEnc) ?? undefined : undefined;

  // CPT 99213 = established patient office/outpatient visit (telehealth)
  const lineItems = [
    {
      description: "Telehealth Video Consultation (30 min)",
      cptCode: "99213",
      amountCents: appt.feeCents,
    },
  ];

  const invoiceDate = new Date().toISOString().split("T")[0]!;
  const invoiceNumber = `INV-${String(appt._id).slice(-10).toUpperCase()}`;

  void audit({
    actor: me,
    actorRole: role,
    action: "invoice.read_pdf",
    target: `Appointment:${id}`,
  });

  const pdf = await renderToBuffer(
    createElement(InvoicePdf, {
      invoiceNumber,
      invoiceDate,
      appointmentDate: new Date(appt.startAt).toISOString(),
      patientName: appt.patient.name,
      patientDob,
      patientInsurance,
      doctorName: appt.doctor.name,
      doctorLicense: docProfile
        ? `${docProfile.licenseNumber} (${docProfile.licenseRegion})`
        : "N/A",
      doctorSpecialty: docProfile?.specialty ?? "General Practice",
      diagnosis,
      lineItems,
      totalCents: appt.feeCents,
    }) as unknown as Parameters<typeof renderToBuffer>[0],
  );

  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="invoice-${invoiceNumber}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
