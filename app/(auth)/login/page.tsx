import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { DemoQuickLogin } from "./DemoQuickLogin";
import { CaduceusIcon } from "@/app/_components/icons";

export const metadata = { title: "Sign in · Vellum Health" };

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string; pending?: string; error?: string }>;
}

const DEMO_ACCOUNTS: ReadonlyArray<readonly [string, string, string]> = [
  ["patient",    "patient@vellum.test",     "password123"],
  ["doctor",     "doc.gp@vellum.test",      "password123"],
  ["pharmacist", "rx-1@vellum.test",        "password123"],
  ["admin",      "admin@vellum.health",     "admin123"],
];

// DEMO_ACCOUNTS kept for reference only; quick login handled by DemoQuickLogin component.

export default async function LoginPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10">
        <div className="masthead">
          <span>
            <CaduceusIcon className="inline-block align-[-3px] w-[14px] h-[14px] text-clay mr-1" /> Sign in
          </span>
          <span className="meta">Vellum Health · Clinic open</span>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10 pb-20 grid grid-cols-12 gap-x-8 gap-y-12">
        <div className="col-span-12 lg:col-span-7 lg:col-start-2">
          <Link href="/" className="btn-link">
            <span aria-hidden>←</span> Vellum Health
          </Link>

          <h1 className="serif-display mt-6 text-[clamp(2.25rem,5.5vw,3.75rem)]">
            Welcome{" "}
            <span className="italic-accent">back.</span>
          </h1>
          <p className="mt-5 text-ink-soft text-[15.5px] leading-[1.7] max-w-[44ch]">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="underline underline-offset-2 text-clay">
              Create one
            </Link>
            .
          </p>

          {sp.pending && (
            <div className="alert-band mt-7 max-w-[58ch]" data-tone="amber" role="status">
              <span>Your clinician application is pending licensure review. We will email you when it is approved.</span>
            </div>
          )}
          {sp.error === "forbidden" && (
            <div className="alert-band mt-7 max-w-[58ch]" data-tone="oxblood" role="alert">
              <span>You do not have permission to access that page.</span>
            </div>
          )}

          <LoginForm callbackUrl={sp.callbackUrl} />

          <DemoQuickLogin />
        </div>

        <aside className="col-span-12 lg:col-span-3 lg:col-start-10 lg:pl-8 lg:border-l border-[color:var(--rule)]">
          <p className="sidenote">
            <strong>On signing in</strong>
            Sessions are short-lived, HttpOnly, and SameSite-Lax. Vellum
            does not retain your password in plain text at any layer; it
            is hashed at rest and salted at issue.
          </p>
          <dl className="mt-6 border-t border-[color:var(--rule)]">
            {[
              ["Encryption", "AES-256-GCM"],
              ["Transport", "TLS 1.3"],
              ["Signatures", "HMAC-SHA256"],
              ["Audit", "Append-only"],
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
