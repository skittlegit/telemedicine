import Link from "next/link";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/lib/models/Appointment";
import { Prescription } from "@/lib/models/Prescription";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { User } from "@/lib/models/User";
import { requireSession } from "@/lib/authz";
import { signOutAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

interface ApptRow {
  _id: string;
  startAt: Date;
  status: string;
  doctor: { _id: string; name: string };
  patient: { _id: string; name: string };
}
interface RxRow {
  _id: string;
  issuedAt: Date;
  drugs: Array<{ name: string }>;
  doctor: { _id: string; name: string };
  patient: { _id: string; name: string };
  fulfilledAt?: Date;
}
interface OrderRow {
  _id: string;
  status: string;
  createdAt: Date;
}

export default async function DashboardPage() {
  const session = await requireSession();
  const role = session.user.role;

  // Pharmacists have their own dashboard.
  if (role === "pharmacist") redirect("/dashboard/pharmacy");

  await connectDB();
  void User;

  const isDoctor = role === "doctor";
  const userField = isDoctor ? "doctor" : "patient";

  const [appts, prescriptions, orders] = await Promise.all([
    Appointment.find({ [userField]: session.user.id })
      .populate("doctor", "name")
      .populate("patient", "name")
      .sort({ startAt: -1 })
      .limit(20)
      .lean<ApptRow[]>(),
    Prescription.find({ [userField]: session.user.id })
      .populate("doctor", "name")
      .populate("patient", "name")
      .sort({ issuedAt: -1 })
      .limit(20)
      .lean<RxRow[]>(),
    isDoctor
      ? Promise.resolve([] as OrderRow[])
      : PharmacyOrder.find({ patient: session.user.id })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean<OrderRow[]>(),
  ]);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-[color:var(--rule-strong)]">
        <div className="mx-auto w-full max-w-[1100px] px-8 py-6 flex items-baseline justify-between">
          <Link href="/" className="eyebrow text-ink-mute hover:text-clay">
            ← Vellum Health
          </Link>
          <div className="flex items-center gap-4 eyebrow">
            <span>{session.user.name} · {role}</span>
            <form action={signOutAction}>
              <button type="submit" className="hover:text-clay">Sign out</button>
            </form>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[1100px] px-8 pb-8">
          <p className="eyebrow">Ledger</p>
          <h1 className="font-display text-6xl tracking-tight mt-2">
            {isDoctor ? "Practice" : "Your records"}
          </h1>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1100px] px-8 py-10 grid gap-10">
        {/* Appointments */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-3xl">Appointments</h2>
            {!isDoctor && (
              <Link href="/doctors" className="btn btn-ghost text-xs">
                Book another →
              </Link>
            )}
          </div>
          {appts.length === 0 ? (
            <p className="text-ink-mute italic text-sm">
              {isDoctor ? "No appointments yet." : "You haven't booked anything yet."}
            </p>
          ) : (
            <ul className="space-y-2">
              {appts.map((a) => (
                <li
                  key={a._id}
                  className="border border-[color:var(--rule)] p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {isDoctor ? a.patient.name : `Dr. ${a.doctor.name}`}
                    </p>
                    <p className="mono text-xs text-ink-mute">
                      {new Date(a.startAt).toLocaleString()} · {a.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(a.status === "scheduled" || a.status === "in_progress") && (
                      <Link
                        href={`/consult/${a._id}`}
                        className="btn btn-clay text-xs"
                      >
                        Join consult →
                      </Link>
                    )}
                    {isDoctor && a.status === "scheduled" && (
                      <Link
                        href={`/dashboard/clinician/prescribe/${a._id}`}
                        className="btn btn-ghost text-xs"
                      >
                        Issue Rx
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Prescriptions */}
        <div>
          <h2 className="font-display text-3xl mb-4">Prescriptions</h2>
          {prescriptions.length === 0 ? (
            <p className="text-ink-mute italic text-sm">No prescriptions on file.</p>
          ) : (
            <ul className="space-y-2">
              {prescriptions.map((r) => (
                <li
                  key={r._id}
                  className="border border-[color:var(--rule)] p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {r.drugs.map((d) => d.name).join(", ")}
                    </p>
                    <p className="mono text-xs text-ink-mute">
                      {new Date(r.issuedAt).toLocaleDateString()} ·{" "}
                      {isDoctor ? r.patient.name : `Dr. ${r.doctor.name}`}
                      {r.fulfilledAt ? " · fulfilled" : ""}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/clinician/prescriptions/${r._id}`}
                    className="btn btn-ghost text-xs"
                  >
                    View →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pharmacy orders (patient only) */}
        {!isDoctor && (
          <div>
            <h2 className="font-display text-3xl mb-4">Pharmacy</h2>
            {orders.length === 0 ? (
              <p className="text-ink-mute italic text-sm">No pharmacy orders.</p>
            ) : (
              <ul className="space-y-2">
                {orders.map((o) => (
                  <li
                    key={o._id}
                    className="border border-[color:var(--rule)] p-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="eyebrow">Order</p>
                      <p className="mono text-xs text-ink-mute">
                        {new Date(o.createdAt).toLocaleString()} · {o.status}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
