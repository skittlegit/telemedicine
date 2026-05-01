import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { connectDB } from "@/lib/db";
import { Prescription } from "@/lib/models/Prescription";
import { User } from "@/lib/models/User";
import { decryptPHI } from "@/lib/crypto";
import { requireSession } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { PrescriptionPdf } from "@/lib/pdf/PrescriptionPdf";
import { prescriptionQrDataUrl } from "@/app/actions/prescription";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RxView {
  _id: string;
  doctor: { _id: string; name: string };
  patient: { _id: string; name: string };
  drugs: Array<{ name: string; dose: string; freq: string; days: number; notes?: string }>;
  diagnosisEnc?: string;
  issuedAt: Date;
  signature: string;
  verifyToken: string;
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
  const rx = await Prescription.findById(id)
    .populate("doctor", "name")
    .populate("patient", "name")
    .lean<RxView | null>();

  if (!rx) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Authz: doctor who issued, patient on the script, or pharmacist (for fulfilment)
  const me = session.user.id;
  const role = session.user.role;
  const allowed =
    String(rx.doctor._id) === me ||
    String(rx.patient._id) === me ||
    role === "pharmacist" ||
    role === "admin";
  if (!allowed) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const qr = await prescriptionQrDataUrl(rx.verifyToken);
  const diagnosis = decryptPHI(rx.diagnosisEnc) ?? "";
  if (rx.diagnosisEnc) {
    void audit({
      actor: me,
      actorRole: role,
      action: "prescription.read_diagnosis_pdf",
      target: `Prescription:${rx._id}`,
    });
  }

  const pdf = await renderToBuffer(
    // The @react-pdf/renderer Document type is awkward to align with React's
    // generic `ReactElement<DocumentProps>`; cast through unknown.
    createElement(PrescriptionPdf, {
      id: String(rx._id),
      doctorName: rx.doctor.name,
      patientName: rx.patient.name,
      issuedAt: new Date(rx.issuedAt).toISOString(),
      drugs: rx.drugs,
      diagnosis,
      signature: rx.signature,
      qrDataUrl: qr,
      verifyUrl: `${env.APP_URL}/verify/${rx.verifyToken}`,
    }) as unknown as Parameters<typeof renderToBuffer>[0],
  );

  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="rx-${rx._id}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
