import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in — Vellum Health" };

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string; pending?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-paper text-ink">
      <div className="w-full max-w-md">
        <Link href="/" className="eyebrow text-ink-mute hover:text-clay">
          ← Vellum Health
        </Link>
        <h1 className="mt-6 font-display text-[clamp(2rem,8vw,4rem)] tracking-[-0.025em] leading-[1] break-words">
          Sign <span className="italic-accent">in.</span>
        </h1>
        <p className="mt-3 text-ink-soft text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-clay underline underline-offset-2">
            Register
          </Link>
        </p>

        {sp.pending && (
          <div className="mt-6 border border-amber/40 bg-amber/10 p-3 text-sm">
            Your clinician application is pending licensure review. We&apos;ll email you when it&apos;s
            approved.
          </div>
        )}
        {sp.error === "forbidden" && (
          <div className="mt-6 border border-oxblood/40 bg-clay-wash p-3 text-sm">
            You don&apos;t have permission to access that page.
          </div>
        )}

        <LoginForm callbackUrl={sp.callbackUrl} />

        <div className="mt-10 border-t border-[color:var(--rule)] pt-6">
          <p className="eyebrow mb-3">Demo accounts</p>
          <p className="text-xs text-ink-mute mb-4 leading-[1.55]">
            This is a portfolio implementation. Use any of these to explore each role:
          </p>
          <ul className="mono text-[12px] divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {[
              ["admin", "admin@vellum.health", "admin123"],
              ["patient", "patient@vellum.test", "patient123"],
              ["doctor", "doctor@vellum.test", "doctor123"],
              ["pharmacist", "pharmacist@vellum.test", "pharmacist123"],
            ].map(([role, email, pw]) => (
              <li
                key={email}
                className="px-3 py-2 flex items-center justify-between gap-3"
              >
                <span className="eyebrow text-clay shrink-0 w-20">{role}</span>
                <span className="truncate">{email}</span>
                <span className="text-ink-mute shrink-0">{pw}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
