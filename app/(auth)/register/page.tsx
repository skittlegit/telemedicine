import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Register · Vellum Health" };

interface PageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const role = sp.role === "doctor" || sp.role === "pharmacist" ? sp.role : "patient";

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10">
        <div className="masthead">
          <span>
            <span className="rx-mark" aria-hidden /> Begin your record
          </span>
          <span className="meta">Vellum Health</span>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10 pb-20 grid grid-cols-12 gap-x-8 gap-y-12">
        <div className="col-span-12 lg:col-span-7 lg:col-start-2">
          <Link href="/" className="btn-link">
            <span aria-hidden>←</span> Vellum Health
          </Link>

          <h1 className="serif-display mt-6 text-[clamp(2.5rem,6vw,4.25rem)]">
            Begin your record.{" "}
            <span className="italic-accent">Quietly.</span>
          </h1>
          <p className="mt-5 text-ink-soft text-[15.5px] leading-[1.7] max-w-[44ch]">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-2 text-clay">
              Sign in
            </Link>
            .
          </p>

          <RegisterForm defaultRole={role} />
        </div>

        <aside className="col-span-12 lg:col-span-3 lg:col-start-10 lg:pl-8 lg:border-l border-[color:var(--rule)]">
          <p className="sidenote">
            <strong>On signing up</strong>
            Vellum stores the minimum personal information required to
            see you safely. Notes, allergies, and history are encrypted
            at the field level before they touch our database.
          </p>
          <dl className="mt-6 border-t border-[color:var(--rule)]">
            {[
              ["Records", "Field-level encrypted"],
              ["Prescriptions", "HMAC signed"],
              ["Identity", "Email-verified"],
              ["Cancel", "Free, anytime"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between border-b border-[color:var(--rule)] py-2">
                <dt className="eyebrow text-[10px]">{k}</dt>
                <dd className="mono text-[11.5px] text-ink tabular">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>
    </main>
  );
}
