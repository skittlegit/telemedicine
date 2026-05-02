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

export const SPECIALTIES: Array<{
  slug: string;
  name: string;
  examples: string;
  icon: ReactNode;
  tagline: string;
  description: string;
  treats: ReadonlyArray<string>;
  doesnt: ReadonlyArray<string>;
}> = [
  {
    slug: "general-practice",
    name: "General practice",
    examples: "Cold, flu, refills, screenings",
    icon: <StethIcon />,
    tagline: "Your front door to medicine.",
    description:
      "Board-certified GPs handle everyday illness, ongoing prescriptions, and the screening conversations every adult should have once a year. If we can't help over video, we'll tell you within five minutes and refund the visit.",
    treats: [
      "Acute illness, colds, flu, sinus, UTI, GI",
      "Routine refills for stable medications",
      "Annual physicals and risk screenings",
      "Travel medicine and pre-travel scripts",
      "Lab result interpretation",
    ],
    doesnt: [
      "Procedures requiring physical exam",
      "Schedule II controlled substances",
    ],
  },
  {
    slug: "mental-health",
    name: "Mental health",
    examples: "Anxiety, sleep, therapy",
    icon: <BrainIcon />,
    tagline: "Talk therapy and psychiatry, on your schedule.",
    description:
      "Licensed therapists for talk-based work and psychiatrists for medication management. Sessions run 45 minutes and can repeat weekly, monthly, or as you need.",
    treats: [
      "Anxiety, depression, panic disorders",
      "Insomnia and sleep disorders",
      "ADHD evaluation and management",
      "Grief, life transitions, burnout",
      "Couples and family sessions",
    ],
    doesnt: [
      "Active suicidal crisis: call 988 or 911",
      "Schedule II stimulants in most states",
    ],
  },
  {
    slug: "dermatology",
    name: "Dermatology",
    examples: "Acne, rashes, photo review",
    icon: <DropIcon />,
    tagline: "Skin work, settled by photo.",
    description:
      "Upload three good photos and a board-certified dermatologist reviews them within hours. We diagnose, prescribe topicals or systemic agents, and route them to your pharmacy the same day.",
    treats: [
      "Acne, rosacea, eczema, psoriasis",
      "Hair loss evaluation",
      "Pigment concerns and melasma",
      "Suspicious mole triage",
      "Anti-aging consultations",
    ],
    doesnt: [
      "Surgical excisions and biopsies",
      "In-office procedures (we refer)",
    ],
  },
  {
    slug: "cardiology",
    name: "Cardiology",
    examples: "Blood pressure, palpitations",
    icon: <HeartIcon />,
    tagline: "Heart conversations without the waiting room.",
    description:
      "Cardiologists for second-opinion consults, follow-ups on existing diagnoses, and medication titration. We coordinate with your local lab or imaging centre when tests are needed.",
    treats: [
      "Hypertension management",
      "Palpitations and rhythm questions",
      "Cholesterol and lipid management",
      "Post-event follow-ups",
      "Pre-surgery cardiac clearance discussion",
    ],
    doesnt: [
      "Active chest pain: call 911",
      "ECG, echo, stress testing (we refer)",
    ],
  },
  {
    slug: "pediatrics",
    name: "Pediatrics",
    examples: "Children 2–17, sick visits",
    icon: <ChildIcon />,
    tagline: "Quick reassurance for your kid, after-hours.",
    description:
      "Pediatricians for ages 2–17. Sick visits, behavioural questions, and prescription bridges when your regular paediatrician is closed.",
    treats: [
      "Acute illness in children 2–17",
      "Rash and skin questions",
      "Behaviour and sleep concerns",
      "Refills for ongoing treatments",
      "Second opinions on diagnoses",
    ],
    doesnt: [
      "Children under 2",
      "Vaccinations (we refer to your clinic)",
    ],
  },
  {
    slug: "womens-health",
    name: "Women's health",
    examples: "Contraception, hormones",
    icon: <FlowerIcon />,
    tagline: "Hormones, contraception, perimenopause, handled.",
    description:
      "Gynaecologists and women's-health specialists for the conversations that don't fit a 7-minute slot. Discreet, asynchronous photos and lab results welcome.",
    treats: [
      "Contraception consultations",
      "Perimenopause and HRT",
      "PCOS and cycle irregularities",
      "PMS, PMDD, mood and cycles",
      "UTI and yeast infection management",
    ],
    doesnt: [
      "Pelvic exams and pap smears",
      "IUD insertion (we refer)",
    ],
  },
  {
    slug: "sexual-health",
    name: "Sexual health",
    examples: "Discreet testing & treatment",
    icon: <ShieldIcon />,
    tagline: "Private, judgment-free, fast.",
    description:
      "STI testing coordination, PrEP and PEP consults, ED and libido conversations. We route lab orders to a partner near you and prescribe within hours of results.",
    treats: [
      "PrEP / PEP consultations",
      "STI symptom triage and treatment",
      "Erectile dysfunction",
      "Premature ejaculation",
      "Sexual desire and arousal concerns",
    ],
    doesnt: [
      "In-person physical exam",
      "Specimen collection (we refer)",
    ],
  },
  {
    slug: "nutrition",
    name: "Nutrition",
    examples: "Weight, diabetes, plans",
    icon: <AppleIcon />,
    tagline: "Food as medicine. Weighed, not preached.",
    description:
      "Registered dietitians for chronic-condition management and weight work, paired with MD oversight when GLP-1s or other medications come into the conversation.",
    treats: [
      "Weight management with or without GLP-1",
      "Type 2 diabetes nutrition",
      "Heart-healthy eating",
      "Sports and athletic nutrition",
      "GI-friendly meal planning",
    ],
    doesnt: [
      "Eating disorders requiring inpatient care",
      "Bariatric surgery clearance",
    ],
  },
];
