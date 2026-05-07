"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { placeMarketplaceOrderAction } from "@/app/actions/pharmacy";

/* =============================================================
   Types & constants — the marketplace UI shape. The page-level
   server component is responsible for mapping PharmacyProfile +
   PharmacyListing rows from the database into these props.
   ============================================================= */

export type Category =
  | "otc"
  | "rx"
  | "wellness"
  | "devices"
  | "first-aid"
  | "cold-chain";

export const CATEGORY_LABEL: Record<Category, string> = {
  otc: "Over the counter",
  rx: "Prescription",
  wellness: "Wellness",
  devices: "Devices",
  "first-aid": "First aid",
  "cold-chain": "Cold chain",
};

export type Pharmacy = {
  id: string;
  name: string;
  monogram: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  deliveryHours: string;
  joined: string;
  verified: boolean;
  coldChain: boolean;
  fulfilled: number;
  tagline: string;
};

export type Product = {
  id: string;
  name: string;
  generic: string;
  strength: string;
  pack: string;
  category: Category;
  price: number;
  mrp: number;
  monogramHue: number;
  tag: string | null;
  rxRequired: boolean;
  inStock: boolean;
  rating: number;
  pharmacyId: string;
};

type SortKey = "relevance" | "price-asc" | "price-desc" | "rating";

type CartLine = { productId: string; qty: number };

const SORT_LABEL: Record<SortKey, string> = {
  relevance: "Relevance",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
  rating: "Rating",
};

export function Marketplace({
  authed = false,
  pharmacies,
  products,
}: {
  authed?: boolean;
  pharmacies: Pharmacy[];
  products: Product[];
}) {
  // Local aliases keep the rest of the body unchanged from the original
  // mock-data implementation.
  const PHARMACIES = pharmacies;
  const PRODUCTS = products;
  const pharmacyById = (id: string) => PHARMACIES.find((p) => p.id === id);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [pharmacy, setPharmacy] = useState<string | "all">("all");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<
    | { id: string; total: number; items: number }
    | null
  >(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    let list = PRODUCTS.slice();
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.generic.toLowerCase().includes(q) ||
          (pharmacyById(p.pharmacyId)?.name.toLowerCase().includes(q) ?? false),
      );
    }
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (pharmacy !== "all") list = list.filter((p) => p.pharmacyId === pharmacy);
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
    }
    return list;
  }, [query, category, pharmacy, sort]);

  const cartCount = cart.reduce((n, l) => n + l.qty, 0);
  const cartTotal = cart.reduce((sum, l) => {
    const p = PRODUCTS.find((x) => x.id === l.productId);
    return sum + (p ? p.price * l.qty : 0);
  }, 0);

  function addToCart(productId: string) {
    setCart((c) => {
      const existing = c.find((l) => l.productId === productId);
      if (existing) {
        return c.map((l) =>
          l.productId === productId ? { ...l, qty: l.qty + 1 } : l,
        );
      }
      return [...c, { productId, qty: 1 }];
    });
  }
  function setQty(productId: string, qty: number) {
    setCart((c) =>
      qty <= 0
        ? c.filter((l) => l.productId !== productId)
        : c.map((l) => (l.productId === productId ? { ...l, qty } : l)),
    );
  }

  return (
    <div data-surface="product" className="min-h-screen bg-paper">
      {/* MASTHEAD — matches every other editorial page */}
      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-6">
        <div className="masthead">
          <span>
            <span className="rx-mark" aria-hidden /> Marketplace
            <span className="meta hidden sm:inline">§ pharmacy</span>
          </span>
          <span className="meta">
            {PHARMACIES.length} verified sellers · {PRODUCTS.length} listings
          </span>
        </div>
      </section>

      {/* HERO STRIP */}
      <section className="border-b border-[color:var(--rule)]">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-8 pb-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Marketplace · §pharmacy</p>
              <h1 className="serif-display mt-3 text-[clamp(2.25rem,5vw,3.75rem)]">
                Verified pharmacies.{" "}
                <span className="italic-accent">One basket.</span>
              </h1>
              <p className="mt-3 max-w-[58ch] text-[14.5px] leading-[1.6] text-ink-soft">
                Vellum hosts a marketplace of independent, verified pharmacies.
                They list inventory; you order. We forward the order, the
                signature, and the audit trail. Prescription items require a
                valid Vellum script at checkout.
              </p>
            </div>
            <dl className="flex items-stretch gap-0 border-y border-[color:var(--rule-strong)] divide-x divide-[color:var(--rule)]">
              <div className="px-5 py-3">
                <dt className="eyebrow text-[10px]">Pharmacies</dt>
                <dd className="mono text-[18px] tabular text-ink mt-1">
                  {String(PHARMACIES.length).padStart(2, "0")}
                </dd>
              </div>
              <div className="px-5 py-3">
                <dt className="eyebrow text-[10px]">Listings</dt>
                <dd className="mono text-[18px] tabular text-ink mt-1">
                  {String(PRODUCTS.length).padStart(3, "0")}
                </dd>
              </div>
              <div className="px-5 py-3">
                <dt className="eyebrow text-[10px]">Cold chain</dt>
                <dd className="mono text-[18px] tabular text-ink mt-1">
                  {PHARMACIES.filter((p) => p.coldChain).length}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-[color:var(--rule)]">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-3 flex flex-wrap items-center gap-3">
          <SearchField value={query} onChange={setQuery} />
          <div className="flex items-center gap-2 ml-auto">
            <SelectField
              label="Sort"
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              options={Object.entries(SORT_LABEL).map(([v, l]) => ({
                value: v,
                label: l,
              }))}
            />
            <SelectField
              label="Pharmacy"
              value={pharmacy}
              onChange={(v) => setPharmacy(v)}
              options={[
                { value: "all", label: "All pharmacies" },
                ...PHARMACIES.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          </div>
        </div>
        {/* Category pills row */}
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pb-3 flex flex-wrap items-center gap-2">
          <CategoryPill
            label="All"
            active={category === "all"}
            onClick={() => setCategory("all")}
          />
          {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
            <CategoryPill
              key={c}
              label={CATEGORY_LABEL[c]}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>
      </section>

      {/* PHARMACY SWITCHER BANNER — visible whenever a single seller is filtered.
          One-click clear back to "All pharmacies", and a horizontal scroll of
          quick-switch chips so the user never has to open the dropdown. */}
      {pharmacy !== "all" && (
        <section className="border-b border-[color:var(--rule)] bg-paper-tint">
          <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-3 flex flex-wrap items-center gap-3">
            <span className="eyebrow text-[10px]">Browsing</span>
            <span className="text-[13.5px] text-ink font-medium">
              {pharmacyById(pharmacy)?.name}
            </span>
            <button
              type="button"
              onClick={() => setPharmacy("all")}
              className="mono text-[11px] tracking-[0.12em] uppercase text-ink-mute hover:text-clay underline underline-offset-4 decoration-[1.5px] decoration-[color:var(--rule-strong)] hover:decoration-clay"
            >
              Show all →
            </button>
            <div className="ml-auto flex items-center gap-2 overflow-x-auto max-w-full">
              <span className="eyebrow text-[10px] whitespace-nowrap">Switch to</span>
              {PHARMACIES.filter((p) => p.id !== pharmacy).slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPharmacy(p.id)}
                  className="whitespace-nowrap px-2.5 py-1 text-[11.5px] tracking-[-0.005em] border border-[color:var(--rule)] bg-paper text-ink-soft hover:border-ink hover:text-ink transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PHARMACIES */}
      {pharmacy === "all" && !query && category === "all" && (
        <section className="border-b border-[color:var(--rule)]">
          <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-8">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-display text-[15px] tracking-[-0.01em] text-ink">
                Sellers on the network
              </h2>
              <span className="eyebrow text-[10px]">
                {PHARMACIES.length} verified
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-5">
              {PHARMACIES.map((ph) => (
                <PharmacyCard
                  key={ph.id}
                  ph={ph}
                  onSelect={() => setPharmacy(ph.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRODUCT GRID */}
      <section>
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-8">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display text-[15px] tracking-[-0.01em] text-ink">
              {pharmacy !== "all"
                ? pharmacyById(pharmacy)?.name + " · listings"
                : category !== "all"
                ? CATEGORY_LABEL[category]
                : query
                ? `Results for "${query}"`
                : "All listings"}
            </h2>
            <span className="eyebrow text-[10px]">
              {filtered.length} item{filtered.length === 1 ? "" : "s"}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="border-y border-[color:var(--rule)] py-16 text-center">
              <p className="font-display text-[18px] text-ink">
                Nothing matches.
              </p>
              <p className="mt-2 text-[13.5px] text-ink-mute">
                Try a different category, or clear the search.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setPharmacy("all");
                }}
                className="btn-link mt-4"
              >
                Reset filters →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
              {filtered.map((p) => (
                <ProductTile
                  key={p.id}
                  product={p}
                  pharmacyName={pharmacyById(p.pharmacyId)?.name ?? ""}
                  inCart={cart.find((l) => l.productId === p.id)?.qty ?? 0}
                  onAdd={() => addToCart(p.id)}
                  onSetQty={(qty) => setQty(p.id, qty)}
                  onSelectPharmacy={() => setPharmacy(p.pharmacyId)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CART PILL — sticky bottom right */}
      {cartCount > 0 && (
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-ink text-paper px-5 py-3 shadow-lg shadow-ink/20 hover:bg-clay-deep transition-colors"
        >
          <span className="mono text-[12px] tracking-[0.1em] uppercase opacity-70">
            Basket
          </span>
          <span className="mono tabular text-[14px]">
            {cartCount} · ₹{cartTotal.toLocaleString("en-IN")}
          </span>
          <span aria-hidden>→</span>
        </button>
      )}

      {/* CART DRAWER */}
      {drawerOpen && (
        <CartDrawer
          cart={cart}
          products={PRODUCTS}
          pharmacies={PHARMACIES}
          onClose={() => setDrawerOpen(false)}
          onSetQty={setQty}
          onClear={() => setCart([])}
          total={cartTotal}
          authed={authed}
          pending={isPending}
          error={checkoutError}
          onCheckout={() => {
            setCheckoutError(null);
            startTransition(async () => {
              const payload = cart
                .map((l) => {
                  const p = PRODUCTS.find((x) => x.id === l.productId);
                  if (!p) return null;
                  return {
                    productId: p.id,
                    name: p.name,
                    strength: p.strength,
                    qty: l.qty,
                    priceCents: Math.round(p.price * 100),
                    pharmacyId: p.pharmacyId,
                  };
                })
                .filter(Boolean) as Parameters<typeof placeMarketplaceOrderAction>[0];
              const res = await placeMarketplaceOrderAction(payload);
              if (res?.error) {
                setCheckoutError(res.error);
                return;
              }
              if (res?.ok && res.orderId) {
                setConfirmation({
                  id: res.orderId.slice(-6).toUpperCase(),
                  total: cartTotal,
                  items: cartCount,
                });
                setCart([]);
                setDrawerOpen(false);
              }
            });
          }}
        />
      )}

      {/* ORDER CONFIRMATION */}
      {confirmation && (
        <ConfirmationModal
          orderId={confirmation.id}
          total={confirmation.total}
          items={confirmation.items}
          onClose={() => setConfirmation(null)}
        />
      )}
    </div>
  );
}

/* =============================================================
   Sub-components
   ============================================================= */

function SearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="relative flex-1 min-w-[220px] max-w-[420px]">
      <span className="sr-only">Search products</span>
      <span
        aria-hidden
        className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
      >
        <SearchIcon />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by molecule, brand, or pharmacy"
        className="field pl-9"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-2 text-[12px] text-ink-mute">
      <span className="eyebrow">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field py-1.5 pr-7 w-auto"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-1.5 text-[12px] tracking-[-0.005em] border transition-colors " +
        (active
          ? "border-ink bg-ink text-paper"
          : "border-[color:var(--rule)] text-ink-soft hover:border-ink hover:text-ink")
      }
    >
      {label}
    </button>
  );
}

function PharmacyCard({
  ph,
  onSelect,
}: {
  ph: Pharmacy;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="text-left group flex flex-col gap-2"
    >
      <div className="aspect-square w-full flex items-center justify-center bg-paper-tint border border-[color:var(--rule)] group-hover:border-ink transition-colors">
        <span className="font-display text-[clamp(1.5rem,4vw,2.25rem)] text-ink-soft tracking-tight">
          {ph.monogram}
        </span>
      </div>
      <div>
        <p className="text-[13px] text-ink leading-tight font-medium">
          {ph.name}
        </p>
        <p className="mono text-[10.5px] text-ink-mute mt-1 tabular">
          {ph.city.toUpperCase()} · ★ {ph.rating.toFixed(1)} · {ph.deliveryHours}h
        </p>
      </div>
    </button>
  );
}

function ProductTile({
  product,
  pharmacyName,
  inCart,
  onAdd,
  onSetQty,
  onSelectPharmacy,
}: {
  product: Product;
  pharmacyName: string;
  inCart: number;
  onAdd: () => void;
  onSetQty: (qty: number) => void;
  onSelectPharmacy: () => void;
}) {
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const tileBg = `oklch(0.93 0.04 ${product.monogramHue})`;
  const tileText = `oklch(0.42 0.12 ${product.monogramHue})`;

  return (
    <article className="flex flex-col">
      <div
        className="relative aspect-square w-full flex items-center justify-center border border-[color:var(--rule)]"
        style={{ background: tileBg }}
      >
        <span
          className="font-display text-[clamp(2rem,5vw,3rem)] tracking-tight"
          style={{ color: tileText }}
        >
          {product.name.slice(0, 2)}
        </span>
        {product.tag && (
          <span className="absolute top-2 left-2 mono text-[9.5px] tracking-[0.12em] uppercase bg-paper text-ink px-1.5 py-0.5">
            {product.tag}
          </span>
        )}
        {product.rxRequired && (
          <span
            title="Prescription required"
            className="absolute top-2 right-2 mono text-[10px] tracking-[0.06em] bg-ink text-paper w-6 h-6 flex items-center justify-center"
          >
            Rx
          </span>
        )}
        {!product.inStock && (
          <span className="absolute inset-0 bg-paper/80 flex items-center justify-center mono text-[11px] tracking-[0.16em] uppercase text-ink-soft">
            Out of stock
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1 min-h-[120px]">
        <h3 className="text-[14px] text-ink leading-tight font-medium">
          {product.name}{" "}
          <span className="text-ink-mute font-normal">{product.strength}</span>
        </h3>
        <p className="text-[12px] text-ink-mute leading-snug">
          {product.generic} · {product.pack}
        </p>
        <button
          onClick={onSelectPharmacy}
          className="text-[11.5px] text-ink-soft hover:text-clay text-left transition-colors mt-0.5"
        >
          {pharmacyName}
        </button>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="mono tabular text-[15px] text-ink font-semibold">
            ₹{product.price}
          </span>
          {off > 0 && (
            <>
              <span className="mono tabular text-[11px] text-ink-faint line-through">
                ₹{product.mrp}
              </span>
              <span className="mono text-[10.5px] text-moss">−{off}%</span>
            </>
          )}
        </div>
      </div>

      <button
        onClick={onAdd}
        disabled={!product.inStock || inCart > 0}
        className={
          "mt-2 text-[12.5px] tracking-[-0.005em] py-2 border transition-colors disabled:cursor-not-allowed " +
          (inCart > 0
            ? "hidden"
            : "border-ink text-ink hover:bg-ink hover:text-paper disabled:opacity-40")
        }
      >
        Add to basket
      </button>
      {inCart > 0 && (
        <div className="mt-2 flex items-stretch border border-ink">
          <button
            type="button"
            onClick={() => onSetQty(inCart - 1)}
            aria-label="Decrease quantity"
            className="w-9 text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            −
          </button>
          <span className="flex-1 text-center mono tabular text-[12.5px] py-2 bg-ink text-paper">
            In basket · {inCart}
          </span>
          <button
            type="button"
            onClick={() => onSetQty(inCart + 1)}
            aria-label="Increase quantity"
            className="w-9 text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            +
          </button>
        </div>
      )}
    </article>
  );
}

function CartDrawer({
  cart,
  products,
  pharmacies,
  onClose,
  onSetQty,
  onClear,
  total,
  authed,
  pending,
  error,
  onCheckout,
}: {
  cart: CartLine[];
  products: Product[];
  pharmacies: Pharmacy[];
  onClose: () => void;
  onSetQty: (id: string, qty: number) => void;
  onClear: () => void;
  total: number;
  authed: boolean;
  pending: boolean;
  error: string | null;
  onCheckout: () => void;
}) {
  const pharmacyById = (id: string) => pharmacies.find((p) => p.id === id);
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-ink/30" />
      <aside
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] bg-paper border-l border-[color:var(--rule-strong)] flex flex-col"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--rule)]">
          <div>
            <p className="eyebrow text-[10px]">Basket</p>
            <h2 className="font-display text-[18px] mt-0.5">Your order</h2>
          </div>
          <div className="flex items-center gap-3">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="mono text-[11px] tracking-[0.12em] uppercase text-ink-mute hover:text-oxblood transition-colors"
              >
                Empty
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-ink-mute hover:text-ink text-[20px] leading-none"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <p className="text-[13px] text-ink-mute">Basket empty.</p>
          ) : (
            <ul className="divide-y divide-[color:var(--rule)]">
              {cart.map((l) => {
                const p = products.find((x) => x.id === l.productId);
                if (!p) return null;
                return (
                  <li key={l.productId} className="py-4 flex gap-3">
                    <div
                      className="w-14 h-14 flex items-center justify-center shrink-0 border border-[color:var(--rule)]"
                      style={{
                        background: `oklch(0.93 0.04 ${p.monogramHue})`,
                      }}
                    >
                      <span
                        className="font-display text-[14px]"
                        style={{ color: `oklch(0.42 0.12 ${p.monogramHue})` }}
                      >
                        {p.name.slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] text-ink leading-tight font-medium">
                        {p.name} {p.strength}
                      </p>
                      <p className="text-[11.5px] text-ink-mute mt-0.5">
                        {pharmacyById(p.pharmacyId)?.name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-[color:var(--rule)]">
                          <button
                            onClick={() => onSetQty(l.productId, l.qty - 1)}
                            className="w-7 h-7 text-ink-mute hover:text-ink"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="mono tabular text-[12.5px] w-7 text-center">
                            {l.qty}
                          </span>
                          <button
                            onClick={() => onSetQty(l.productId, l.qty + 1)}
                            className="w-7 h-7 text-ink-mute hover:text-ink"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="mono tabular text-[13px] text-ink">
                          ₹{(p.price * l.qty).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="border-t border-[color:var(--rule-strong)] px-5 py-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="eyebrow">Subtotal</span>
            <span className="mono tabular text-[16px] text-ink font-semibold">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-[11.5px] text-ink-mute leading-snug">
            Delivery and verification fees calculated at checkout. Prescription
            items require a valid Vellum script.
          </p>
          {error && (
            <div role="alert" className="alert-band" data-tone="oxblood">
              <span>{error}</span>
            </div>
          )}
          {authed ? (
            <button
              type="button"
              onClick={onCheckout}
              disabled={cart.length === 0 || pending}
              className="block w-full text-center bg-ink text-paper py-3 text-[13.5px] tracking-[-0.005em] hover:bg-clay-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {pending ? "Placing order…" : "Place order →"}
            </button>
          ) : (
            <Link
              href="/login?callbackUrl=/pharmacy"
              className="block w-full text-center bg-ink text-paper py-3 text-[13.5px] tracking-[-0.005em] hover:bg-clay-deep transition-colors"
            >
              Sign in to checkout →
            </Link>
          )}
        </footer>
      </aside>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ConfirmationModal({
  orderId,
  total,
  items,
  onClose,
}: {
  orderId: string;
  total: number;
  items: number;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-confirmed"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] bg-paper border border-[color:var(--rule-strong)]"
      >
        <div className="px-7 pt-7 pb-2">
          <p className="eyebrow text-moss">Order placed</p>
          <h2
            id="order-confirmed"
            className="serif-section text-[clamp(1.5rem,3vw,2rem)] mt-2 leading-[1.1]"
          >
            Thank you. <span className="italic-accent">On its way.</span>
          </h2>
          <p className="mt-3 text-[14px] text-ink-soft leading-[1.6]">
            Your basket has been forwarded to the participating pharmacies.
            Track delivery from your orders page.
          </p>
        </div>
        <dl className="mx-7 my-5 grid grid-cols-3 gap-px bg-[color:var(--rule)] border-y border-[color:var(--rule-strong)]">
          <div className="bg-paper px-3 py-3">
            <dt className="eyebrow text-[10px]">Order</dt>
            <dd className="mono text-[12px] mt-1 text-ink">{orderId}</dd>
          </div>
          <div className="bg-paper px-3 py-3">
            <dt className="eyebrow text-[10px]">Items</dt>
            <dd className="serif-section text-[18px] mt-1 tabular text-ink leading-none">
              {items}
            </dd>
          </div>
          <div className="bg-paper px-3 py-3">
            <dt className="eyebrow text-[10px]">Total</dt>
            <dd className="serif-section text-[18px] mt-1 tabular text-ink leading-none">
              ₹{total.toLocaleString("en-IN")}
            </dd>
          </div>
        </dl>
        <div className="px-7 pb-7 flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="btn btn-clay btn-sm"
            onClick={onClose}
          >
            View orders →
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}
