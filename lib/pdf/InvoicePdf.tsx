import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: "Helvetica", color: "#1A1814" },
  hdr: { borderBottomWidth: 1, borderBottomColor: "#1A1814", paddingBottom: 8, marginBottom: 16 },
  title: { fontSize: 24, fontFamily: "Times-Roman", marginBottom: 4 },
  eyebrow: { fontSize: 8, letterSpacing: 1.5, textTransform: "uppercase", color: "#7A736A" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  block: { marginTop: 16 },
  mono: { fontFamily: "Courier" },
  small: { fontSize: 9, color: "#3D3933" },
  table: { marginTop: 16 },
  tableHdr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1A1814",
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    paddingVertical: 6,
  },
  colDesc: { flex: 3 },
  colCode: { flex: 1, textAlign: "center" },
  colAmt: { flex: 1, textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 24,
  },
  totalLabel: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  totalAmt: { fontSize: 10, fontFamily: "Helvetica-Bold", fontFamily2: "Courier" },
  footer: {
    fontSize: 8,
    color: "#7A736A",
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    paddingTop: 8,
  },
  claimBox: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
  },
});

export interface InvoiceLineItem {
  description: string;
  cptCode: string;
  amountCents: number;
}

export interface InvoicePdfProps {
  invoiceNumber: string;
  invoiceDate: string;
  appointmentDate: string;
  patientName: string;
  patientDob?: string;
  patientInsurance?: string;
  doctorName: string;
  doctorLicense: string;
  doctorSpecialty: string;
  diagnosis?: string;
  lineItems: InvoiceLineItem[];
  totalCents: number;
}

function cents(n: number): string {
  return `$${(n / 100).toFixed(2)}`;
}

export function InvoicePdf(props: InvoicePdfProps) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.hdr}>
          <Text style={s.eyebrow}>Vellum Health · Medical Invoice</Text>
          <Text style={s.title}>Invoice</Text>
        </View>

        <View style={s.row}>
          <View>
            <Text style={s.eyebrow}>Invoice No.</Text>
            <Text style={s.mono}>{props.invoiceNumber}</Text>
          </View>
          <View>
            <Text style={s.eyebrow}>Invoice Date</Text>
            <Text style={s.mono}>{props.invoiceDate}</Text>
          </View>
        </View>

        <View style={[s.row, { marginTop: 16 }]}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={s.eyebrow}>Bill To (Patient)</Text>
            <Text style={{ marginTop: 2 }}>{props.patientName}</Text>
            {props.patientDob ? (
              <Text style={s.small}>DOB: {props.patientDob}</Text>
            ) : null}
            {props.patientInsurance ? (
              <Text style={s.small}>Insurance: {props.patientInsurance}</Text>
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.eyebrow}>Service Provider</Text>
            <Text style={{ marginTop: 2 }}>Vellum Health</Text>
            <Text style={s.small}>Dr. {props.doctorName}</Text>
            <Text style={s.small}>
              {props.doctorSpecialty} · Lic. {props.doctorLicense}
            </Text>
          </View>
        </View>

        <View style={s.block}>
          <Text style={s.eyebrow}>Service Date</Text>
          <Text style={[s.mono, { marginTop: 2 }]}>{props.appointmentDate}</Text>
        </View>

        {props.diagnosis ? (
          <View style={s.block}>
            <Text style={s.eyebrow}>Diagnosis / Clinical Notes</Text>
            <Text style={{ marginTop: 4 }}>{props.diagnosis}</Text>
          </View>
        ) : null}

        <View style={s.table}>
          <Text style={s.eyebrow}>Services Rendered</Text>
          <View style={s.tableHdr}>
            <Text style={[s.colDesc, s.eyebrow]}>Description</Text>
            <Text style={[s.colCode, s.eyebrow]}>CPT Code</Text>
            <Text style={[s.colAmt, s.eyebrow]}>Amount</Text>
          </View>
          {props.lineItems.map((item, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={s.colDesc}>{item.description}</Text>
              <Text style={[s.colCode, s.mono]}>{item.cptCode}</Text>
              <Text style={[s.colAmt, s.mono]}>{cents(item.amountCents)}</Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total Due</Text>
            <Text style={[s.mono, { fontSize: 10 }]}>{cents(props.totalCents)}</Text>
          </View>
        </View>

        <View style={s.claimBox}>
          <Text style={s.eyebrow}>Insurance Claim Information</Text>
          <Text style={[s.small, { marginTop: 6 }]}>
            This document may be submitted to your insurance provider as a superbill for
            reimbursement. Please include your insurance member ID and group number when filing.
            Services were rendered via HIPAA-compliant telehealth video consultation.
          </Text>
          <Text style={[s.small, { marginTop: 4 }]}>
            Place of Service Code: 02 (Telehealth — Patient Home) · Provider NPI: Vellum Health
          </Text>
        </View>

        <Text style={s.footer}>
          Vellum Health · vellum.health · For billing enquiries contact billing@vellum.health ·
          This invoice was generated automatically and is valid without a signature.
        </Text>
      </Page>
    </Document>
  );
}
