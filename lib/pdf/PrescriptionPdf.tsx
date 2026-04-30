import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: "Helvetica", color: "#1A1814" },
  hdr: { borderBottomWidth: 1, borderBottomColor: "#1A1814", paddingBottom: 8, marginBottom: 16 },
  title: { fontSize: 24, fontFamily: "Times-Roman", marginBottom: 4 },
  eyebrow: { fontSize: 8, letterSpacing: 1.5, textTransform: "uppercase", color: "#7A736A" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  block: { marginTop: 16 },
  drug: {
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    paddingVertical: 8,
  },
  drugName: { fontSize: 13, fontFamily: "Times-Roman" },
  small: { fontSize: 9, color: "#3D3933" },
  qrRow: { flexDirection: "row", marginTop: 24, gap: 16, alignItems: "flex-start" },
  qr: { width: 96, height: 96 },
  sig: { fontSize: 7, color: "#7A736A", marginTop: 24 },
  mono: { fontFamily: "Courier" },
});

interface DrugItem {
  name: string;
  dose: string;
  freq: string;
  days: number;
  notes?: string;
}

export interface PrescriptionPdfProps {
  id: string;
  doctorName: string;
  patientName: string;
  issuedAt: string;
  drugs: DrugItem[];
  diagnosis: string;
  signature: string;
  qrDataUrl: string;
  verifyUrl: string;
}

export function PrescriptionPdf(props: PrescriptionPdfProps) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.hdr}>
          <Text style={s.eyebrow}>Vellum Health · Prescription</Text>
          <Text style={s.title}>℞ Prescription</Text>
        </View>

        <View style={s.row}>
          <View>
            <Text style={s.eyebrow}>Patient</Text>
            <Text>{props.patientName}</Text>
          </View>
          <View>
            <Text style={s.eyebrow}>Issued</Text>
            <Text style={s.mono}>{props.issuedAt}</Text>
          </View>
        </View>

        <View style={s.row}>
          <View>
            <Text style={s.eyebrow}>Issued by</Text>
            <Text>Dr. {props.doctorName}</Text>
          </View>
          <View>
            <Text style={s.eyebrow}>Reference</Text>
            <Text style={s.mono}>{props.id}</Text>
          </View>
        </View>

        {props.diagnosis ? (
          <View style={s.block}>
            <Text style={s.eyebrow}>Diagnosis</Text>
            <Text style={{ marginTop: 4 }}>{props.diagnosis}</Text>
          </View>
        ) : null}

        <View style={s.block}>
          <Text style={s.eyebrow}>Prescribed</Text>
          {props.drugs.map((d, i) => (
            <View key={i} style={s.drug}>
              <Text style={s.drugName}>
                {d.name} <Text style={s.mono}>· {d.dose}</Text>
              </Text>
              <Text style={s.small}>
                {d.freq} · for {d.days} days
                {d.notes ? ` · ${d.notes}` : ""}
              </Text>
            </View>
          ))}
        </View>

        <View style={s.qrRow}>
          {props.qrDataUrl ? <Image src={props.qrDataUrl} style={s.qr} /> : null}
          <View style={{ flex: 1 }}>
            <Text style={s.eyebrow}>Verify</Text>
            <Text style={[s.mono, { fontSize: 8 }]}>{props.verifyUrl}</Text>
            <Text style={[s.small, { marginTop: 8 }]}>
              Scan or visit the link above to confirm authenticity. Verification is performed
              against an HMAC-SHA256 signature over the prescription payload.
            </Text>
          </View>
        </View>

        <Text style={s.sig}>HMAC: {props.signature}</Text>
      </Page>
    </Document>
  );
}
