import type { ReactNode } from "react";

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  );
}
export function VideoIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <rect x="2" y="6" width="14" height="12" rx="1" />
      <path d="M22 8l-6 4 6 4V8z" />
    </svg>
  );
}
export function PillIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <rect x="2" y="9" width="20" height="6" rx="3" transform="rotate(-30 12 12)" />
      <path d="M12 6.5l5 8.7" />
    </svg>
  );
}
export function StethIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M5 3v6a5 5 0 0 0 10 0V3" />
      <path d="M10 14v2a4 4 0 0 0 8 0v-2" />
      <circle cx="18" cy="11" r="2" />
    </svg>
  );
}
export function BrainIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5 3 3 0 0 0 2 5v1a3 3 0 0 0 3 3h.5V4H9zM15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-2 5v1a3 3 0 0 1-3 3h-.5V4H15z" />
    </svg>
  );
}
export function HeartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
    </svg>
  );
}
export function DropIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" />
    </svg>
  );
}
export function ChildIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <circle cx="12" cy="6" r="3" />
      <path d="M6 21v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3" />
    </svg>
  );
}
export function FlowerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10V4M12 14v6M10 12H4M14 12h6" />
    </svg>
  );
}
export function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M12 3l8 3v6c0 4-3.5 7.5-8 9-4.5-1.5-8-5-8-9V6l8-3z" />
    </svg>
  );
}
export function AppleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M12 8c0-2 1.5-3.5 3-3.5M12 8c-3.5 0-6 2-6 6s3 7 6 7 6-3 6-7-2.5-6-6-6z" />
    </svg>
  );
}
export function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M12 3l2.6 5.7 6.4.6-4.8 4.4 1.4 6.3L12 17l-5.6 3 1.4-6.3-4.8-4.4 6.4-.6L12 3z" />
    </svg>
  );
}

export const SPECIALTIES: Array<{ name: string; examples: string; icon: ReactNode }> = [
  { name: "General practice", examples: "Cold, flu, refills, screenings", icon: <StethIcon /> },
  { name: "Mental health", examples: "Anxiety, sleep, therapy", icon: <BrainIcon /> },
  { name: "Dermatology", examples: "Acne, rashes, photo review", icon: <DropIcon /> },
  { name: "Cardiology", examples: "Blood pressure, palpitations", icon: <HeartIcon /> },
  { name: "Pediatrics", examples: "Children 2–17, sick visits", icon: <ChildIcon /> },
  { name: "Women's health", examples: "Contraception, hormones", icon: <FlowerIcon /> },
  { name: "Sexual health", examples: "Discreet testing & treatment", icon: <ShieldIcon /> },
  { name: "Nutrition", examples: "Weight, diabetes, plans", icon: <AppleIcon /> },
];
