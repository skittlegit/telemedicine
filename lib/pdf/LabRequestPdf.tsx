import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: "Helvetica", color: "#1A1814" },
  hdr: { borderBottomWidth: 1, borderBottomColor: "#1A1814", paddingBottom: 8, marginBottom: 16 },
  title: { fontSize: 24, fontFamily: "Times-Roman", marginBottom: 4 },
  eyebrow: { fontSize: 8, letterSpacing: 1.5, textTransform: "uppercase", color: "#7A736A" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  block: { marginTop: 16 },
  test: {
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    paddingVertical: 8,
    flexDirection: "row",
    gap: 8,
  },
  num: { fontSize: 10, color: "#7A736A", width: 20 },
  testName: { fontSize: 13, fontFamily: "Times-Roman", flex: 1 },
  notes: { fontSize: 9, color: "#3D3933", marginTop: 2 },
  mono: { fontFamily: "Courier" },
  footer: { fontSize: 8, color: "#7A736A", marginTop: 32, borderTopWidth: 1, borderTopColor: "#DDD", paddingTop: 8 },
});

export interface LabRequestPdfProps {
  appointmentId: string;
  doctorName: string;
  licenseNumber: string;
  licenseRegion: string;
  patientName: string;
  issuedAt: string;
  labRequests: Array<{ test: string; notes?: string }>;
  reason?: string;
}

export function LabRequestPdf(props: LabRequestPdfProps) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.hdr}>
          <Text style={s.eyebrow}>Vellum Health · Laboratory Request</Text>
          <Text style={s.title}>Lab Request</Text>
        </View>

        <View style={s.row}>
          <View>
            <Text style={s.eyebrow}>Patient</Text>
            <Text>{props.patientName}</Text>
          </View>
          <View>
            <Text style={s.eyebrow}>Date Issued</Text>
            <Text style={s.mono}>{props.issuedAt}</Text>
          </View>
        </View>

        <View style={s.row}>
          <View>
            <Text style={s.eyebrow}>Ordering Physician</Text>
            <Text>Dr. {props.doctorName}</Text>
            <Text style={s.notes}>
              Lic. {props.licenseNumber} · {props.licenseRegion}
            </Text>
          </View>
          <View>
            <Text style={s.eyebrow}>Reference</Text>
            <Text style={s.mono}>{props.appointmentId.slice(-12).toUpperCase()}</Text>
          </View>
        </View>

        {props.reason ? (
          <View style={s.block}>
            <Text style={s.eyebrow}>Clinical Indication</Text>
            <Text style={{ marginTop: 4 }}>{props.reason}</Text>
          </View>
        ) : null}

        <View style={s.block}>
          <Text style={s.eyebrow}>Tests Requested</Text>
          {props.labRequests.map((item, i) => (
            <View key={i} style={s.test}>
              <Text style={s.num}>{i + 1}.</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.testName}>{item.test}</Text>
                {item.notes ? <Text style={s.notes}>{item.notes}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        <Text style={s.footer}>
          This laboratory request was issued via Vellum Health telemedicine platform. Results should
          be sent to the ordering physician and made available in the patient portal.
        </Text>
      </Page>
    </Document>
  );
}
