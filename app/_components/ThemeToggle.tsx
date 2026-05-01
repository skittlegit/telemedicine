"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

function readTheme(): Theme {
  if (typeof document === "undefined") return "system";
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "light" || explicit === "dark") return explicit;
  return "system";
}

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  if (t === "system") {
    document.documentElement.removeAttribute("data-theme");
    try {
      window.localStorage.removeItem("vellum-theme");
    } catch {}
    return;
  }
  document.documentElement.setAttribute("data-theme", t);
  try {
    window.localStorage.setItem("vellum-theme", t);
  } catch {}
}

/**
 * Two-state toggle (light <-> dark). Click cycles. Long-press could go to
 * system; for now we keep it simple. The initial paint is set inline before
 * hydration via the script in <head>, so no flash.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next: Theme = isDark ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  // Avoid hydration mismatch — render a static placeholder until mounted.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle theme"
      className={`inline-flex items-center justify-center w-9 h-9 rounded-md text-ink-soft hover:text-ink hover:bg-paper-tint transition-colors ${className}`}
    >
      {mounted ? (
        <SunMoon
          isDark={
            theme === "dark" ||
            (theme === "system" &&
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches)
          }
        />
      ) : (
        <SunMoon isDark={false} />
      )}
    </button>
  );
}

function SunMoon({ isDark }: { isDark: boolean }) {
  if (isDark) {
    return (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m4.93 19.07 1.41-1.41" />
      <path d="m17.66 6.34 1.41-1.41" />
    </svg>
  );
}

export const NO_FLASH_SCRIPT = `(function(){try{var s=localStorage.getItem('vellum-theme');if(s==='dark'||s==='light'){document.documentElement.setAttribute('data-theme',s);}}catch(e){}})();`;
