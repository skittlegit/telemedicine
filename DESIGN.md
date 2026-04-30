# Design

## Visual Theme

**Editorial clinical.** The look is closer to a contemporary print magazine spread (think `Apartamento`, `Cabana`, `The Gentlewoman`) than to a SaaS landing page. Long measure, deep margins, hairline rules, opinionated serif display typography over a warm-bone surface.

The recurring signature is a **single italic Fraunces fragment** inside otherwise upright headlines, in warm aubergine `--accent`. It is used once per surface — never as decoration on every line.

Cards are hairline grids on a tinted surface (gap-px borders), not boxed cards with shadows. Buttons are 4px radius rectangles, not pills. There are no gradients on text and no soft drop-shadows.

## Color

OKLCH is the source of truth for new colors; values below are the legacy hex shipped in `app/globals.css`. The palette strategy is **Restrained**: a single brand chroma (violet `--clay`) and a single accent chroma (aubergine `--accent`), with three muted clinical-status colors that never appear in marketing chrome.

| Token            | Hex        | Role                                                              |
| ---------------- | ---------- | ----------------------------------------------------------------- |
| `--paper`        | `#F6F2E9`  | Primary surface (warm bone, never `#fff`).                        |
| `--paper-tint`   | `#EFEAE0`  | Tinted band between sections, well backgrounds.                   |
| `--paper-deep`   | `#E5DECF`  | Heaviest tinted band, footer, image placeholders.                 |
| `--ink`          | `#1F1A2E`  | Body text, headlines, primary button background (never `#000`).   |
| `--ink-soft`     | `#3D3450`  | Secondary body text inside long passages.                         |
| `--ink-mute`     | `#7A6F8A`  | Eyebrow / metadata / mono labels.                                 |
| `--ink-faint`    | `#B0A8BF`  | Disabled, placeholders, decorative dividers only.                 |
| `--clay`         | `#5B3FCF`  | Primary brand violet. Buttons, focus ring, link underline.        |
| `--clay-deep`    | `#3D2899`  | Hover/active state for clay; never used as a flat surface.        |
| `--clay-wash`    | `#ECE5FF`  | Avatar backgrounds, subtle highlight tags.                        |
| `--accent`       | `#6D3F8E`  | Italic-serif headline accent. **Reserved for italic-accent only.**|
| `--moss`         | `#4D7D5A`  | Sage success — clinical surfaces only.                            |
| `--amber`        | `#B8821A`  | Ochre warning — clinical surfaces only.                           |
| `--oxblood`      | `#8B2E2E`  | Oxblood danger — clinical surfaces only.                          |
| `--rule`         | `rgba(31,26,46,0.10)` | Default hairline rule.                                |
| `--rule-strong`  | `rgba(31,26,46,0.20)` | Card border, table border, button-ghost border.       |

**Background atmosphere:** two very low-opacity radial gradients painted on `<html>`, one violet at top-left and one ochre at bottom-right, both at 5% alpha. This is the only place gradients are permitted.

**Forbidden:**
- `#000` and `#ffffff` as fill colors. Use `--ink` and `--paper`.
- Gradient text or gradient buttons.
- Teal, mint, navy, peach — they belong to anti-reference categories.
- Any color outside the table above as a primary fill.

## Typography

Three families, each with one job.

| Family                       | Variable               | Job                                                               |
| ---------------------------- | ---------------------- | ----------------------------------------------------------------- |
| **Fraunces** (variable)      | `--font-fraunces`      | Display headlines (`opsz 144`, `SOFT 50`) and italic-accent fragments (`opsz 144`, `SOFT 100`, italic). |
| **IBM Plex Sans**            | `--font-plex`          | Body, labels, buttons, navigation. `font-feature-settings: "ss01","cv11"`. |
| **IBM Plex Mono**            | `--font-plex-mono`     | Eyebrows, IDs, fee values, prescription codes, audit timestamps. Never marketing copy. |

**Type scale (display):** all big headlines use a `clamp()` so they never overflow at 320px. Reference values currently in the codebase:

- Hero H1: `clamp(2rem, 8vw, 6.5rem)` with `break-words`.
- Section H2: `clamp(1.6rem, 5vw, 3.5rem)` with `break-words`.
- Final-CTA H2: `clamp(1.85rem, 6vw, 4.5rem)`.
- Auth/dashboard page H1: `clamp(2rem, 8vw, 4rem)`.

Display headlines always carry `font-variation-settings: "opsz" 144, "SOFT" 50` and `letter-spacing: -0.025em`, `line-height: 0.98`.

**Eyebrow pattern:** `.eyebrow` class — Plex Mono 11px, `letter-spacing 0.16em`, uppercase, `--ink-mute`. Always paired above a display headline. Never used inside body copy.

**Italic accent rule:** exactly one italic-accent fragment per page hero. Color is `--accent`, never `--clay`. The fragment is an emotional unit (a verb, an adjective, a name) — never a connector word.

**Body measure:** 65–75ch maximum. The codebase enforces this through `max-w-prose` and explicit container widths.

**Forbidden:**
- More than one italic-accent fragment in the same headline.
- Mono used as a heading or marketing tagline.
- Headlines without the optical-size axis pinned (will look fragile at large sizes).
- All-caps body copy. All-caps is reserved for `.eyebrow` and `.stamp`.

## Spacing & Layout

**Grid:** 12-col implied via Tailwind `grid-cols-{n}`. Hairlines between cells use `gap-px` on a `--rule-strong` background — this is the dominant card pattern. Never use `box-shadow` to separate cards.

**Section padding:** `px-5 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24`. Mobile minimum is 5 (`1.25rem`), not 4 — verified against 320px viewports.

**Vertical rhythm:** sections separated by `<hr class="rule" />` or by a `border-t border-[--rule]` change in band tint. No empty `<div>` spacers.

**Container widths:**
- Marketing main: `max-w-[1280px] mx-auto`.
- Editorial body copy: `max-w-prose` (≈65ch).
- Dashboard shell: `max-w-[1400px]`.

**Radius scale:** `4px` for buttons, cards, wells, inputs (subtle). `0` for tables and section bands. No fully-rounded pills except the role badge in the dashboard mobile sheet.

## Components

Defined in `app/globals.css` and consumed across the app. Treat these as the primitive layer; do not ship one-off variants.

- **`.btn` / `.btn-clay` / `.btn-ghost`** — 4px radius, 13px Plex Sans, 0.7rem×1.2rem padding, 1px ink border. Hover swaps to `--clay-deep`. Focus ring is `0 0 0 3px rgba(91,63,207,0.25)`.
- **`.field`** — bottom-rule input, no left/right/top border, focus underline is `--clay`.
- **`.well`** — `paper-tint` background, hairline border, 4px radius, 1.5rem padding. Use for callouts and forms.
- **`.card`** — `paper` background, `rule-strong` border. Used in directory grids and stat tiles.
- **`.stamp`** — rotated -1.5° tag, mono 10.5px uppercase, `--clay` outline. Use sparingly for editorial marks ("flat fee", "verified").
- **`.eyebrow`** — see Typography.
- **`.rule` / `.rule-double`** — horizontal hairlines.

**Card grids:** `grid grid-cols-{n} gap-px bg-[--rule-strong]` with `bg-paper` cells. This produces the hairline-grid look without per-cell borders.

**Avatars:** circular, `bg-clay-wash text-clay`, initials in display Fraunces. Never photographic stock images.

## Motion

`motion/react` (NOT framer-motion). Two motion primitives:

- **PageTransition** in `app/_components/PageTransition.tsx` — `AnimatePresence mode="wait"`, fade + 8px y-translate, `duration 0.28`, ease `[0.22,0.61,0.36,1]` (ease-out-quart). Keyed on `pathname`.
- **MarketingHeader sheet** — same ease, slightly slower (`0.32`), translates from y:-16 to 0 with opacity.

**Allowed entrance animations:** opacity, transform (translate, scale ≤1.02). **Forbidden:** animating `width`, `height`, `top/left`, `margin`, `padding`, or anything that triggers layout. Animate transforms only.

**Reduced motion:** all `*` animation-duration is 0.01ms under `prefers-reduced-motion: reduce`. Always test with the OS toggle on.

## Iconography

Custom 24×24 stroke icons in `app/_components/icons.tsx`. `stroke-width="1.5"`, `stroke="currentColor"`, `fill="none"`. No Lucide, no Heroicons. New icons must match the existing line weight and corner style.

## Accessibility

- Color contrast: every ink/paper combo verified at AA. The `--accent` italic on `--paper` is verified for the display headline weight only — do not reuse it on body text.
- Focus ring: `0 0 0 3px rgba(91,63,207,0.25)` on every interactive element. Never `outline: none` without a replacement.
- Keyboard order: visual order matches DOM order in every page.
- 320px viewport: no horizontal scroll. `html` and `body` carry `overflow-x: clip`. Long mono strings use `overflow-wrap: anywhere`.

## Responsive Breakpoints

Tailwind defaults. Concrete behaviors:

- `<sm` (≤639px): single column, hamburger nav, mobile sheet for dashboard.
- `sm` (≥640px): two columns where applicable, padding bumps to `px-6`.
- `md` (≥768px): doctors directory goes 2-column, dashboard sidebar visible.
- `lg` (≥1024px): full marketing 3–5 column layouts, padding `px-8`.

## Anti-patterns (forbidden in this codebase)

1. **Card shadows** — use hairline borders.
2. **Gradient buttons or text** — solid fills only.
3. **Stock photography** — initials avatars or none.
4. **More than one italic-accent fragment per page hero.**
5. **Heroicons / Lucide** — match existing custom set.
6. **Pill-shaped buttons** (`border-radius: 999px`) — use 4px.
7. **`#000` / `#fff`** — use ink/paper tokens.
8. **Animating layout properties** (width/height/top/left/margin/padding).
9. **Side-stripe accent borders on cards.**
10. **Glassmorphism / blur-as-default** — backdrop-blur is allowed only on the sticky header at 85% paper.
