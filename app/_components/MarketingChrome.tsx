import Link from "next/link";

export function Caduceus({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3v18" />
      <path d="M9 8h6" />
      <path d="M8 5c-1 1.5-1 3 0 4.5s2.5 2 2.5 3.5-1 2.5-2.5 2.5" />
      <path d="M16 5c1 1.5 1 3 0 4.5s-2.5 2-2.5 3.5 1 2.5 2.5 2.5" />
      <path d="M5 6.5c1.5 0 2.5-1 2.5-2 0-.5-.3-1-1-1" />
    </svg>
  );
}

export function MarketingHeader() {
  return (
    <header className="border-b border-[color:var(--rule)] bg-paper/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Caduceus className="text-clay" />
          <span className="font-display text-[24px] tracking-[-0.02em] leading-none">
            Vellum<span className="italic-accent"> Health</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-9 eyebrow">
          <Link href="/doctors" className="hover:text-clay transition-colors">
            Find a doctor
          </Link>
          <Link href="/how-it-works" className="hover:text-clay transition-colors">
            How it works
          </Link>
          <Link href="/specialties" className="hover:text-clay transition-colors">
            Specialties
          </Link>
          <Link href="/security" className="hover:text-clay transition-colors">
            Security
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="eyebrow hover:text-clay transition-colors" prefetch>
            Sign in
          </Link>
          <Link href="/register" className="btn btn-clay" prefetch>
            Get care
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-[color:var(--rule-strong)]">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5">
            <Caduceus className="text-clay" />
            <span className="font-display text-[22px] tracking-[-0.02em] leading-none">
              Vellum<span className="italic-accent"> Health</span>
            </span>
          </Link>
          <p className="mt-4 text-ink-mute text-[13px] leading-[1.65] max-w-[34ch]">
            Telemedicine done with care. Encrypted, signed, licensed.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Patients</p>
          <ul className="space-y-1.5 text-[13.5px] text-ink-soft">
            <li><Link className="hover:text-clay" href="/register">Create account</Link></li>
            <li><Link className="hover:text-clay" href="/doctors">Find a doctor</Link></li>
            <li><Link className="hover:text-clay" href="/dashboard">Your records</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Learn</p>
          <ul className="space-y-1.5 text-[13.5px] text-ink-soft">
            <li><Link className="hover:text-clay" href="/how-it-works">How it works</Link></li>
            <li><Link className="hover:text-clay" href="/specialties">Specialties</Link></li>
            <li><Link className="hover:text-clay" href="/security">Security</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Status</p>
          <p className="mono text-[12px] text-ink-mute leading-[1.7]">
            build · 0.1.0<br />
            status · <span className="text-moss">all systems operational</span>
          </p>
        </div>
      </div>
      <div className="border-t border-[color:var(--rule)]">
        <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3 eyebrow">
          <span>© 2026 Vellum Health · all rights reserved</span>
          <span>Portfolio implementation. Not a real medical service.</span>
        </div>
      </div>
    </footer>
  );
}
