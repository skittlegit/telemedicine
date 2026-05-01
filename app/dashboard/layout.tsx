import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/authz";
import { AppShell } from "./_components/AppShell";
import type { SidebarSection } from "./_components/Sidebar";
import {
  CalendarIcon,
  PillIcon,
  StethIcon,
  ShieldIcon,
} from "@/app/_components/icons";

/**
 * Minimal "home" icon. Tabler-style 1.5px stroke, matches the rest of the icon
 * set in `app/_components/icons.tsx`.
 */
function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </svg>
  );
}

const NAV_BY_ROLE: Record<string, SidebarSection[]> = {
  patient: [
    {
      heading: "Care",
      items: [
        { href: "/dashboard", label: "Today", icon: <HomeIcon />, exact: true },
        { href: "/dashboard/doctors", label: "Find a doctor", icon: <StethIcon /> },
        {
          href: "/dashboard/prescriptions",
          label: "Prescriptions",
          icon: <PillIcon />,
        },
        { href: "/dashboard/orders", label: "Pharmacy orders", icon: <ListIcon /> },
        { href: "/dashboard/visits", label: "Visits", icon: <CalendarIcon /> },
        { href: "/dashboard/records", label: "Records", icon: <FileIcon /> },
      ],
    },
    {
      heading: "Account",
      items: [
        { href: "/dashboard/profile", label: "Profile", icon: <UserIcon /> },
      ],
    },
  ],
  doctor: [
    {
      heading: "Practice",
      items: [
        { href: "/dashboard", label: "Today", icon: <HomeIcon />, exact: true },
        { href: "/dashboard/clinician/schedule", label: "Schedule", icon: <CalendarIcon /> },
        { href: "/dashboard/clinician/prescriptions", label: "Prescriptions", icon: <PillIcon /> },
      ],
    },
    {
      heading: "Account",
      items: [
        { href: "/dashboard/clinician/profile", label: "Profile", icon: <UserIcon /> },
      ],
    },
  ],
  pharmacist: [
    {
      heading: "Dispensary",
      items: [
        { href: "/dashboard/pharmacy", label: "Queue", icon: <ListIcon />, exact: true },
        { href: "/dashboard/pharmacy/active", label: "Active", icon: <PillIcon /> },
        { href: "/dashboard/pharmacy/history", label: "History", icon: <FileIcon /> },
      ],
    },
    {
      heading: "Account",
      items: [
        { href: "/dashboard/pharmacy/profile", label: "Profile", icon: <UserIcon /> },
      ],
    },
  ],
  admin: [
    {
      heading: "Operations",
      items: [
        { href: "/dashboard/admin", label: "Overview", icon: <ChartIcon />, exact: true },
        { href: "/dashboard/admin/approvals", label: "Approvals", icon: <ShieldIcon /> },
        { href: "/dashboard/admin/clinicians", label: "Clinicians", icon: <StethIcon /> },
        { href: "/dashboard/admin/audit", label: "Audit log", icon: <FileIcon /> },
      ],
    },
  ],
};

// Suppress unused-warnings for icon imports we may wire in later phases.

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");
  const role = (session.user as { role?: string }).role ?? "patient";
  const nav = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.patient;

  return (
    <AppShell
      user={{ name: session.user.name ?? "User", role }}
      nav={nav}
    >
      {children}
    </AppShell>
  );
}
