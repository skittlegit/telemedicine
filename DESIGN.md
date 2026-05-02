# Design

## Visual Theme

**Editorial clinical.** The look sits closer to a contemporary print magazine (Apartamento, The Gentlewoman, Disegno) than to a SaaS landing page. Warm-bone surface, deep margins, hairline rules, opinionated serif display typography.

**Two surfaces, one language.** The brand surface (marketing) is typographic and editorial. The product surface (dashboard, booking, consult) is precise and functional. Both share the same color tokens, type families, and hairline-grid component system — marketing uses the full expressive range; product uses restraint.

The recurring brand signature is a **single italic Fraunces fragment** inside an otherwise upright headline, colored `--accent`. Used once per brand-surface page hero. Never used on the product surface.

Cards are hairline grids on a tinted surface (gap-px borders). Buttons are 4px radius rectangles. No gradients on text, no soft drop-shadows.

## Color

OKLCH is the source of truth for new colors. The palette strategy is **Restrained**: tinted neutrals, one brand chroma (violet `--clay`), one reserved accent (aubergine `--accent`). The product is **light-only** — no dark mode.

| Token           | Hex                   | Role                                                              |
| --------------- | --------------------- | ----------------------------------------------------------------- |
| `--paper`       | `#F4F1E9`             | Primary surface (warm bone, never `#fff`)                         |
| `--paper-tint`  | `#EDE9DF`             | Section bands, well backgrounds                                   |
| `--paper-deep`  | `#E2DCCE`             | Footer, image placeholders, deepest bands                         |
| `--ink`         | `#1F1A2E`             | Body, headlines, primary button fill (never `#000`)               |
| `--ink-soft`    | `#3D3450`             | Secondary body in long passages                                   |
| `--ink-mute`    | `#7A6F8A`             | Eyebrow, metadata, mono labels                                    |
| `--ink-faint`   | `#B0A8BF`             | Disabled, placeholders, decorative rules                          |
| `--clay`        | `#5B3FCF`             | Primary brand violet. Buttons, focus ring, link underline         |
| `--clay-deep`   | `#3D2899`             | Hover/active for clay. Never used as a flat surface               |
| `--clay-wash`   | `#ECE5FF`             | Avatar backgrounds, subtle highlight tags                         |
| `--accent`      | `#6D3F8E`             | Italic-serif fragment only. Never on interactive elements         |
| `--moss`        | `#4D7D5A`             | Success — clinical surfaces only                                  |
| `--amber`       | `#B8821A`             | Warning — clinical surfaces only                                  |
| `--oxblood`     | `#8B2E2E`             | Danger — clinical surfaces only                                   |
| `--rule`        | `rgba(31,26,46,0.10)` | Default hairline                                                  |
| `--rule-strong` | `rgba(31,26,46,0.20)` | Card/table/button-ghost border                                    |

**Background atmosphere (brand surface only):** two very low-opacity radial gradients on `<html>`, one violet top-left and one ochre bottom-right at 5% alpha. Forbidden on the product surface.

**Forbidden:**
- `#000` / `#ffffff` as fills. Use `--ink` / `--paper`.
- Gradient buttons or gradient text.
- Teal, mint, navy, peach — anti-reference palette.
- Any fill color outside the table above.

## Typography

Three families, one job each.

| Family                  | Variable          | Job                                                                                     |
| ----------------------- | ----------------- | --------------------------------------------------------------------------------------- |
| **Fraunces** (variable) | `--font-fraunces` | Display headlines (`opsz 144`, `SOFT 50`) and italic-accent fragments (`SOFT 100`, italic) |
| **IBM Plex Sans**       | `--font-plex`     | Body, labels, buttons, navigation                                                       |
| **JetBrains Mono**      | `--font-plex-mono`| IDs, fees, timestamps, prescription codes, audit trails. Never marketing copy           |

> **Implementation note:** `layout.tsx` currently imports `Inter` for `--font-plex`. This should be corrected to `IBM_Plex_Sans` from `next/font/google` for brand alignment. `JetBrains_Mono` is already correct.

**Type scale (display):**
- Hero H1: `clamp(2rem, 8vw, 6.5rem)`, `font-variation-settings: "opsz" 144, "SOFT" 50`, `letter-spacing: -0.025em`, `line-height: 0.98`
- Section H2: `clamp(1.6rem, 5vw, 3.5rem)`, same variation settings
- Final-CTA H2: `clamp(1.85rem, 6vw, 4.5rem)`
- Dashboard page H1: `clamp(2rem, 8vw, 4rem)` (same variation settings, no italic accent)

**Eyebrow pattern:** `.eyebrow` — JetBrains Mono 11px, `letter-spacing: 0.16em`, uppercase, `--ink-mute`. Paired above a display headline. Never inside body copy.

**Italic accent rule:** exactly one italic-accent Fraunces fragment per brand-surface page hero. Color is `--accent`, never `--clay`. The fragment is an emotional unit (a verb, an adjective, a name) — never a connector word. Never used on the product surface.

**Body measure:** 65-75ch max. Enforced via `max-w-prose`.

**Forbidden:**
- More than one italic-accent fragment per headline.
- JetBrains Mono as heading or marketing copy.
- Headlines without `opsz` axis pinned (will look fragile at large sizes).
- All-caps body. All-caps for `.eyebrow` and `.stamp` only.

## Spacing & Layout

**Grid:** 12-col via Tailwind `grid-cols-{n}`. Hairlines between cells: `gap-px` on `bg-[--rule-strong]` with `bg-paper` cells. Never use `box-shadow` to separate cards.

**Section padding:** `px-5 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24`. Mobile minimum is `px-5` (1.25rem) — verified against 320px viewports.

**Container widths:**
- Marketing main: `max-w-[1280px] mx-auto`
- Body copy: `max-w-prose` (~65ch)
- Dashboard shell: `max-w-[1400px]`

**Radius scale:** `4px` for buttons, inputs, wells, cards. `0` for tables and section bands. No pills except the role badge in the dashboard mobile sheet.

**Vertical rhythm:** sections separated by `<hr class="rule" />` or `border-t border-[--rule]` change in band tint. No empty `<div>` spacers.

## Components

Primitives defined in `app/globals.css`. Treat as the primitive layer — do not ship one-off variants.

**Global primitives:**
- **`.btn` / `.btn-clay` / `.btn-ghost`** — 4px radius, 13px Plex, `0.7rem x 1.2rem` padding, 1px ink border. Hover: `--clay-deep`. Focus ring: `0 0 0 3px rgba(91,63,207,0.25)`.
- **`.field`** — bottom-rule input, no left/right/top border. Focus underline is `--clay`.
- **`.well`** — `--paper-tint` background, hairline border, 4px radius, 1.5rem padding. For callouts and forms.
- **`.card`** — `--paper` background, `--rule-strong` border. Used in directory grids and stat tiles.
- **`.stamp`** — rotated -1.5 degrees, JetBrains Mono 10.5px uppercase, `--clay` outline. Sparingly, for editorial marks ("flat fee", "verified").
- **`.eyebrow`** — see Typography.
- **`.rule` / `.rule-double`** — horizontal hairlines.

**Card grid pattern:** `grid grid-cols-{n} gap-px bg-[--rule-strong]` with `bg-paper` cells. The hairline-grid look without per-cell borders.

**Avatars:** circular, `bg-clay-wash text-clay`, initials in Fraunces. Never stock photography.

**Layout components:**
- **`MarketingChrome`** (`app/_components/MarketingChrome.tsx`) — sticky header at 85% paper opacity + `backdrop-blur`. Caduceus wordmark, main nav, MarketingFooter. Brand surface only.
- **`AppShell`** (`app/dashboard/_components/AppShell.tsx`) — product surface shell, composes Sidebar + Topbar. `--paper` background.
- **`Sidebar`** — `max-w-[240px]`, `--paper-tint` background, hairline right border. Active nav link uses `--clay`. No icons beside labels.
- **`Topbar`** — `--paper` background, hairline bottom border. Minimal: breadcrumb or page title on the left, user menu on the right.
- **`DashboardMobileNav` / `MobileBottomNav`** — below `sm`, a bottom sheet slides up. Uses the same token set.

**Motion components:**
- **`PageTransition`** (`app/_components/PageTransition.tsx`) — `AnimatePresence mode="wait"`, fade + 8px y-translate, 0.28s ease-out-quart `[0.22,0.61,0.36,1]`. Keyed on `pathname`.
- **`FadeUp`** (`app/_components/FadeUp.tsx`) — stagger entrance helper. Opacity + 12px y-translate, same easing. For lists and grid items.

## Motion

Library: `motion/react` (package: `motion ^12`). Not `framer-motion`.

**Allowed:** opacity, transform (translate, scale up to 1.02). **Forbidden:** animating `width`, `height`, `top/left`, `margin`, `padding`, or any property that triggers layout recalculation.

**Easing:** ease-out-quart `cubic-bezier(0.22, 0.61, 0.36, 1)`. No bounce, no elastic.

**Durations:** 0.28s (page transitions), 0.32s (sheets), 0.18s (micro-interactions like button hover).

**`prefers-reduced-motion`:** all `*` animation-duration collapses to 0.01ms. Test with OS toggle.

## Iconography

Custom 24 x 24 stroke icons in `app/_components/icons.tsx`. `stroke-width="1.5"`, `stroke="currentColor"`, `fill="none"`. New icons must match this line weight and corner style.

`lucide-react` is installed as a dependency but must not be used in the UI. All new icons go in `icons.tsx`.

## Accessibility

- Contrast: every ink/paper combo verified at AA (4.5:1 body, 3:1 muted/eyebrow).
- `--accent` italic on `--paper` verified at display heading weight only. Do not reuse on body text.
- Focus ring: `0 0 0 3px rgba(91,63,207,0.25)` on every interactive element. Never `outline: none` without a replacement.
- DOM order matches visual order on all pages.
- 320px: no horizontal scroll. `html` and `body` carry `overflow-x: clip`. Long mono strings use `overflow-wrap: anywhere`.
- Status colors (moss/amber/oxblood) always paired with a text label or icon — never color alone.

## Responsive Breakpoints

Tailwind defaults. Concrete behaviors:

- `<sm` (up to 639px): single column, hamburger nav, bottom sheet for dashboard.
- `sm` (640px and up): two columns where applicable, `px-6`.
- `md` (768px and up): doctors grid 2-col, dashboard sidebar visible.
- `lg` (1024px and up): full 3-5 column layouts, `px-8`.

## Anti-patterns (forbidden in this codebase)

1. **Card shadows** — use hairline borders.
2. **Gradient buttons or text** — solid fills only.
3. **Stock photography** — initials avatars or none.
4. **More than one italic-accent fragment per hero.**
5. **Heroicons / Lucide in the UI** — use `icons.tsx` only.
6. **Pill-shaped buttons** — 4px radius only.
7. **`#000` / `#fff` fills** — use ink/paper tokens.
8. **Animating layout properties** (width/height/top/left/margin/padding).
9. **Side-stripe accent borders on cards.**
10. **Glassmorphism** — `backdrop-blur` only on the sticky header.
11. **Dark mode** — the product is light-only. `ThemeToggle.tsx` and all dark-mode CSS should be removed.
12. **Background atmosphere gradients on the product surface** — brand surface (`<html>`) only.
