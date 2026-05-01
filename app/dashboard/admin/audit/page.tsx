import { connectDB } from "@/lib/db";
import { AuditLog } from "@/lib/models/AuditLog";
import { User } from "@/lib/models/User";
import { requireRole } from "@/lib/authz";
import {
  PageHeader,
  Section,
  EmptyState,
} from "@/app/dashboard/_components/Shell";

export const dynamic = "force-dynamic";

interface AuditRow {
  _id: string;
  actor?: string;
  actorRole?: string;
  action: string;
  target?: string;
  ip?: string;
  createdAt: Date;
}

export default async function AuditPage() {
  await requireRole("admin");
  await connectDB();

  const rows = await AuditLog.find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .lean<AuditRow[]>();

  const actorIds = Array.from(
    new Set(rows.map((r) => r.actor).filter(Boolean) as string[]),
  );
  const actors = actorIds.length
    ? await User.find({ _id: { $in: actorIds } })
        .select("name email")
        .lean<{ _id: string; name: string; email: string }[]>()
    : [];
  const actorMap = new Map(actors.map((a) => [String(a._id), a]));

  return (
    <>
      <PageHeader eyebrow="Admin · Trace" title="Audit log">
        Append-only stream of system events. Showing the most recent 200.
      </PageHeader>

      <Section eyebrow="Events" title={`${rows.length} entries`}>
        {rows.length === 0 ? (
          <EmptyState message="Log is empty." />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {rows.map((r) => {
              const actor = r.actor ? actorMap.get(String(r.actor)) : null;
              return (
                <li key={r._id} className="px-4 py-3 grid gap-1">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-medium mono text-[12px]">{r.action}</p>
                    <p className="mono text-[11px] text-ink-mute">
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="mono text-[11px] text-ink-mute">
                    {actor
                      ? `${actor.name} (${actor.email})`
                      : r.actorRole ?? "system"}
                    {r.target ? ` · → ${r.target}` : ""}
                    {r.ip ? ` · ${r.ip}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </>
  );
}
