import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in — Vellum Health" };

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string; pending?: string; error?: string }>;
}

/**
 * Demo accounts shown in the disclosure below the form. Visible in all
 * environments by request — reviewers and recruiters land on a deployed
 * Vellum and need a way in without seed scripts. Risk is accepted: the
 * patient/doctor/pharmacist accounts only resolve in non-production (the
 * upsert in `lib/db.ts` is gated on `NODE_ENV !== "production"`), and the
 * admin row uses the env-driven `ADMIN_PASSWORD` so we never ship a known
 * admin password to a production database.
 */
const DEMO_ACCOUNTS: ReadonlyArray<readonly [string, string, string]> = [
  ["patient",    "patient@vellum.test",     "patient123"],
  ["doctor",     "doctor@vellum.test",      "doctor123"],
  ["pharmacist", "pharmacist@vellum.test",  "pharmacist123"],
  ["admin",      "admin@vellum.health",     "admin123"],
];

export default async function LoginPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const isProd = process.env.NODE_ENV === "production";
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-paper text-ink">
      <div className="w-full max-w-md">
        <Link href="/" className="eyebrow text-ink-mute hover:text-clay">
          ← Vellum Health
        </Link>
        <h1 className="mt-5 text-[28px] sm:text-[32px] font-semibold tracking-[-0.022em] leading-[1.15]">
          Sign in
        </h1>
        <p className="mt-2 text-ink-soft text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-clay underline underline-offset-2">
            Create one
          </Link>
        </p>

        {sp.pending && (
          <div className="mt-5 border border-amber/40 bg-amber/10 px-3 py-2.5 text-[13px] rounded-sm">
            Your clinician application is pending licensure review. We&apos;ll email you when it&apos;s approved.
          </div>
        )}
        {sp.error === "forbidden" && (
          <div className="mt-5 border border-oxblood/40 bg-clay-wash px-3 py-2.5 text-[13px] rounded-sm">
            You don&apos;t have permission to access that page.
          </div>
        )}

        <LoginForm callbackUrl={sp.callbackUrl} />

        <details className="mt-8 border-t border-[color:var(--rule)] pt-5">
          <summary className="cursor-pointer eyebrow text-ink-mute hover:text-ink select-none">
            Demo accounts
          </summary>
          <p className="text-[12px] text-ink-mute mt-3 leading-[1.55]">
            Pre-seeded reviewer accounts. The patient, doctor, and pharmacist credentials
            only resolve in non-production environments. The admin password shown is the
            development default — production deployments require <code>ADMIN_PASSWORD</code> to be set.
            {isProd && (
              <>
                {" "}
                <span className="text-amber">You appear to be on production:</span> only
                the admin row is guaranteed to work, and only with the operator-set password.
              </>
            )}
          </p>
          <ul className="mono text-[12px] divide-y divide-[color:var(--rule)] border border-[color:var(--rule)] mt-3 rounded-sm overflow-hidden">
            {DEMO_ACCOUNTS.map(([role, email, pw]) => (
              <li
                key={email}
                className="px-3 py-2 flex items-center justify-between gap-3"
              >
                <span className="eyebrow text-clay shrink-0 w-20">{role}</span>
                <span className="truncate flex-1">{email}</span>
                <span className="text-ink-mute shrink-0">{pw}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </main>
  );
}
