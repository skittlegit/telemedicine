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
        <h1 className="mt-4 font-display text-5xl tracking-tight">Sign in</h1>
        <p className="mt-2 text-ink-soft text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-clay underline">
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
      </div>
    </main>
  );
}
