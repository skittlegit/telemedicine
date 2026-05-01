import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Register — Vellum Health" };

interface PageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const role = sp.role === "doctor" || sp.role === "pharmacist" ? sp.role : "patient";
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-paper text-ink">
      <div className="w-full max-w-md">
        <Link href="/" className="eyebrow text-ink-mute hover:text-clay">
          ← Vellum Health
        </Link>
        <h1 className="mt-6 text-[32px] sm:text-[40px] font-semibold tracking-[-0.025em] leading-[1.05]">
          Begin your record.
        </h1>
        <p className="mt-3 text-ink-soft text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-clay underline underline-offset-2">
            Sign in
          </Link>
        </p>
        <RegisterForm defaultRole={role} />
      </div>
    </main>
  );
}
