import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { User } from "@/lib/models/User";
import { Appointment } from "@/lib/models/Appointment";
import { requireRole } from "@/lib/authz";
import { BookForm, type SlotDay } from "./BookForm";

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

const SLOT_TIMES: Array<{ time: string; h: number; m: number }> = [
  { time: "09:00", h: 9, m: 0 },
  { time: "11:00", h: 11, m: 0 },
  { time: "13:00", h: 13, m: 0 },
  { time: "15:00", h: 15, m: 0 },
  { time: "17:00", h: 17, m: 0 },
  { time: "19:00", h: 19, m: 0 },
];

const DAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildSlotDays(takenSet: Set<string>): SlotDay[] {
  const now = new Date();
  const days: SlotDay[] = [];
  for (let offset = 0; offset < 3; offset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    const dateLabel =
      offset === 0
        ? "Today"
        : offset === 1
          ? "Tomorrow"
          : `${DAY_LABEL[d.getDay()]} ${d.getDate()}`;
    const dateStr = d.toISOString().slice(0, 10);
    const slots = SLOT_TIMES.map(({ time, h, m }) => {
      const slotDate = new Date(d);
      slotDate.setHours(h, m, 0, 0);
      const iso = slotDate.toISOString();
      const past = slotDate.getTime() < Date.now() + 60 * 60 * 1000; // need 1h lead
      return {
        time,
        iso,
        disabled: past || takenSet.has(iso),
      };
    });
    days.push({ label: dateLabel, date: dateStr, slots });
  }
  return days;
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

  // Pull existing appointments in next 4 days to mark taken slots
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 4);
  const existing = await Appointment.find({
    doctor: doc.user._id,
    startAt: { $gte: new Date(), $lt: horizon },
    status: { $in: ["scheduled", "in_progress", "pending_payment"] },
  })
    .select("startAt")
    .lean<Array<{ startAt: Date }>>();
  const takenSet = new Set(existing.map((a) => new Date(a.startAt).toISOString()));

  const days = buildSlotDays(takenSet);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto w-full max-w-[860px] px-5 sm:px-8 py-10 sm:py-12">
        <Link
          href={`/dashboard/doctors/${doc._id}`}
          className="eyebrow text-ink-mute hover:text-clay"
        >
          ← Back to profile
        </Link>

        <header className="mt-4 flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[color:var(--rule)]">
          <div>
            <p className="eyebrow mb-2">Book a consultation</p>
            <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.022em] leading-[1.15]">
              With Dr. {doc.user.name}
              <span className="text-ink-mute font-normal"> · {doc.specialty}</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="eyebrow">Visit fee</p>
            <p className="text-[22px] font-semibold mt-1">
              ${(doc.consultationFeeCents / 100).toFixed(0)}
            </p>
            <p className="text-[12px] text-ink-mute mt-0.5">30-minute video</p>
          </div>
        </header>

        <div className="mt-8">
          <BookForm
            doctorId={doc._id}
            doctorName={doc.user.name}
            feeCents={doc.consultationFeeCents}
            days={days}
          />
        </div>
      </div>
    </main>
  );
}
