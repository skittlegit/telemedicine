"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { type SidebarSection } from "./Sidebar";

/**
 * Build a breadcrumb chain by matching the current pathname against the
 * active sidebar section's items. We pick the deepest matching item as the
 * "page" and use its section heading as the parent crumb.
 */
function crumbsFor(
  pathname: string,
  nav: SidebarSection[],
): { label: string; href?: string }[] {
  let best: { sectionHeading: string; label: string; href: string } | null =
    null;
  for (const section of nav) {
    for (const item of section.items) {
      const exactHit = pathname === item.href;
      const prefixHit = pathname.startsWith(`${item.href}/`);
      if (exactHit || prefixHit) {
        if (!best || item.href.length > best.href.length) {
          best = {
            sectionHeading: section.heading,
            label: item.label,
            href: item.href,
          };
        }
      }
    }
  }
  if (!best) return [{ label: "Dashboard" }];
  return [
    { label: best.sectionHeading },
    { label: best.label, href: best.href },
  ];
}

export function Topbar({
  user,
  nav,
}: {
  user: { name: string; role: string };
  nav: SidebarSection[];
}) {
  const pathname = usePathname() ?? "";
  const crumbs = crumbsFor(pathname, nav);

  return (
    <div className="sticky top-0 z-30 h-[56px] bg-paper/95 backdrop-blur-md border-b border-[color:var(--rule)]">
      <div className="h-full px-5 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex items-center gap-2 text-[13px] text-ink-mute">
              {crumbs.map((c, i) => (
                <li key={`${c.label}-${i}`} className="flex items-center gap-2">
                  {i > 0 && (
                    <span aria-hidden className="text-ink-faint">
                      /
                    </span>
                  )}
                  {c.href && i < crumbs.length - 1 ? (
                    <Link
                      href={c.href}
                      className="hover:text-ink truncate"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        i === crumbs.length - 1
                          ? "text-ink font-medium truncate"
                          : "truncate"
                      }
                      aria-current={
                        i === crumbs.length - 1 ? "page" : undefined
                      }
                    >
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="hidden sm:inline-flex items-center mono text-[10.5px] tracking-[0.18em] uppercase text-ink-mute"
            aria-label={`Signed in as ${user.role}`}
          >
            {user.role}
          </span>
        </div>
      </div>
    </div>
  );
}
