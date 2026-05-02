import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { PharmacyListing } from "@/lib/models/PharmacyListing";
import {
  PageHeader,
  Section,
  EmptyState,
} from "@/app/dashboard/_components/Shell";
import { formatINR2 } from "@/lib/money";
import {
  updateListingAction,
  deleteListingAction,
} from "@/app/actions/pharmacy";
import { AddListingForm } from "./AddListingForm";

export const dynamic = "force-dynamic";

interface Row {
  _id: string;
  name: string;
  generic?: string;
  category: string;
  priceCents: number;
  stock: number;
  active: boolean;
  createdAt?: Date;
}

const CATEGORY_LABEL: Record<string, string> = {
  otc: "Over the counter",
  rx: "Prescription",
  wellness: "Wellness",
  devices: "Devices",
  "first-aid": "First aid",
  "cold-chain": "Cold chain",
};

export default async function PharmacyListingsPage() {
  const session = await requireRole("pharmacist");
  await connectDB();
  const listings = await PharmacyListing.find({ pharmacy: session.user.id })
    .sort({ active: -1, createdAt: -1 })
    .lean<Row[]>();

  const lowStock = listings.filter((l) => l.active && l.stock <= 5).length;

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Your listings"
        italic="on the marketplace."
      >
        Add new medicines, adjust stock, and toggle availability. Listings are
        visible to patients on the public marketplace.
      </PageHeader>

      <Section eyebrow="Add" title="New listing">
        <AddListingForm />
      </Section>

      <Section
        eyebrow="On file"
        title={`${listings.length} listing${listings.length === 1 ? "" : "s"}`}
        action={
          lowStock > 0 ? (
            <span className="eyebrow text-amber">{lowStock} low stock</span>
          ) : null
        }
      >
        {listings.length === 0 ? (
          <EmptyState message="No listings yet. Add your first medicine above." />
        ) : (
          <div className="border border-[color:var(--rule)] divide-y divide-[color:var(--rule)]">
            {listings.map((l) => (
              <div
                key={l._id}
                className="grid grid-cols-12 gap-3 px-4 py-4 items-center"
              >
                <div className="col-span-12 md:col-span-4 min-w-0">
                  <p className="font-medium text-[14px] text-ink truncate">
                    {l.name}
                  </p>
                  <p className="mono text-[11px] text-ink-mute mt-0.5 uppercase tracking-[0.12em]">
                    {CATEGORY_LABEL[l.category] ?? l.category}
                    {l.generic ? ` · ${l.generic}` : ""}
                  </p>
                </div>

                <form
                  action={updateListingAction}
                  className="col-span-6 md:col-span-3 flex items-center gap-2"
                >
                  <input type="hidden" name="id" value={l._id} />
                  <label className="eyebrow text-[10px] text-ink-mute">
                    Price ₹
                  </label>
                  <input
                    name="priceRupees"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={(l.priceCents / 100).toFixed(2)}
                    className="field h-9 w-24 px-2 py-1 text-[13px] tabular"
                  />
                  <button type="submit" className="btn btn-ghost btn-sm">
                    Save
                  </button>
                </form>

                <form
                  action={updateListingAction}
                  className="col-span-6 md:col-span-2 flex items-center gap-2"
                >
                  <input type="hidden" name="id" value={l._id} />
                  <label className="eyebrow text-[10px] text-ink-mute">
                    Stock
                  </label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    defaultValue={l.stock}
                    className={
                      "field h-9 w-20 px-2 py-1 text-[13px] tabular " +
                      (l.stock <= 5 ? "border-amber" : "")
                    }
                  />
                  <button type="submit" className="btn btn-ghost btn-sm">
                    Save
                  </button>
                </form>

                <div className="col-span-8 md:col-span-2 mono text-[11.5px] text-ink-mute tabular">
                  {formatINR2(l.priceCents)}
                </div>

                <div className="col-span-4 md:col-span-1 flex items-center justify-end gap-2">
                  <form action={updateListingAction}>
                    <input type="hidden" name="id" value={l._id} />
                    <input
                      type="hidden"
                      name="active"
                      value={l.active ? "0" : "1"}
                    />
                    <button
                      type="submit"
                      className={
                        "px-2 py-0.5 border text-[10.5px] tracking-[0.14em] uppercase font-medium " +
                        (l.active
                          ? "border-moss/40 bg-moss/10 text-moss"
                          : "border-[color:var(--rule-strong)] bg-paper-tint text-ink-mute")
                      }
                      title={l.active ? "Click to disable" : "Click to enable"}
                    >
                      {l.active ? "Live" : "Hidden"}
                    </button>
                  </form>
                  <form action={deleteListingAction}>
                    <input type="hidden" name="id" value={l._id} />
                    <button
                      type="submit"
                      className="text-[12px] text-oxblood hover:underline"
                      aria-label={`Remove ${l.name}`}
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
