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
        <h1 className="mt-4 font-display text-5xl tracking-tight">Register</h1>
        <p className="mt-2 text-ink-soft text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-clay underline">
            Sign in
          </Link>
        </p>
        <RegisterForm defaultRole={role} />
      </div>
    </main>
  );
}
