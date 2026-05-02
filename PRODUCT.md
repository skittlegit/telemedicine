# Product

## Register

split

The surface determines the register. `/`, `/how-it-works`, `/doctors`, `/specialties/*`, `/pricing`, `/security` are **brand**. `/dashboard/*`, `/book/*`, `/consult/*`, `/(auth)/*` are **product**. When a surface is ambiguous, default to brand unless the task is explicitly about app functionality.

## Users

**Primary (patient):** adults 28-55 in the US, health-literate but not health-obsessed, comfortable booking things online, deeply skeptical of both hospital bureaucracy and chatbot-first telehealth. They arrive slightly anxious, often after self-diagnosing on their phone. They need to decide in 30 seconds whether this platform is a real clinic or another SaaS funnel.

**Secondary (clinician):** licensed physicians and pharmacists evaluating whether Vellum is a serious platform worth joining. They notice unprofessionalism immediately and will not apply if the product looks built by marketers.

**In-session (active patient):** a patient already booked, navigating the dashboard or consult room. Low patience for friction. One task at a time. Every extra click is a failure.

## Product Purpose

Vellum Health is a flat-fee, video-first telemedicine clinic with same-day pharmacy fulfilment and field-level encrypted records. It removes three drains from a routine doctor visit: insurance friction, waiting rooms, and prescription forgery.

Success is threefold:
1. A new patient completes booking on their first visit without abandoning.
2. An active patient reaches a prescription or a resolved consultation with no dead ends.
3. A clinician signs off on a prescription in under two minutes.

## Brand Personality

**Three words:** precise, unhurried, earned.

**Voice:** direct and specific. Says what happens, in what order, for what flat fee, signed by whom. Never markets emotion at the user. The platform's confidence comes from its evidence (licensed doctors, verified IDs, encrypted records) — not from marketing copy.

**Italic-serif accent is the only warmth.** One Fraunces italic fragment per brand-surface page hero, in `--accent`. The rest of the typography is upright and functional.

**Product surface tone:** quieter than marketing. Less editorial, more clinical. Labels are concise. Empty states explain the absence, not the potential. Error messages say what went wrong and what to do next.

## Anti-references

Match-and-refuse. If any of these could describe a design choice, rework it.

- **Generic telemedicine SaaS** (Hims, Ro, Teladoc): clinical-teal accents, soft-shadow rounded cards, gradient CTAs, stock model photos, "Get started in seconds" hero.
- **Hospital-corporate:** navy + white, all-sans, blue ribbons, "Care that puts you first," sterile photography.
- **Wellness-startup pastel:** mint/peach gradients, blob illustrations, rounded-everything, anthropomorphic mascots.
- **Crypto/AI dark-mode reflex:** neon-on-black, glow effects, animated gradients, "Powered by AI" badges.
- **SaaS-dashboard-gray:** mid-gray sidebar, white card grid, blue accent buttons, icon-heavy navigation. This is the product-surface equivalent of the brand anti-references above.

## Design Principles

1. **Editorial over SaaS (brand surface).** The marketing site reads closer to a print magazine than a product landing page. Long measure, deep margins, hairline rules, display typography. If a design choice could belong on a SaaS landing page, rework it.

2. **Evidence over persuasion.** On both surfaces: trust comes from specificity. A named doctor, a flat fee, a prescription ID. Not from claims like "better care." Show the fact, never the feeling.

3. **One signature per surface.** Brand: the italic-accent Fraunces fragment in the hero headline. Product: the hairline-grid layout. Neither is repeated decoratively. One clear signal per page, used once.

4. **Density without noise (product surface).** Dashboard layouts hold more information than marketing pages, but never more than the current task requires. Whitespace is a rest point between actions, not a design statement.

5. **Mono is clinical evidence.** JetBrains Mono signals "this is a verifiable fact." Reserved for IDs, fees, timestamps, prescription codes, and audit trails. Never in headings or marketing copy.

6. **Errors are instructions.** Form errors, empty states, and failed states say exactly what went wrong and what to do next. No vague "Something went wrong."

## Accessibility & Inclusion

- WCAG 2.1 AA minimum. All ink-on-paper combinations must clear 4.5:1; eyebrow and muted text 3:1 on `--paper`.
- `--accent` italic on `--paper` verified for display headline weight only. Do not reuse on body text or buttons.
- `prefers-reduced-motion`: all entrance animations collapse to 0.01ms duration.
- Keyboard-only path through the booking and consult flows must be unbroken.
- Forms remain usable at 320px. No horizontal scroll.
- Color is never the only signal for status: success/warning/error always pair color with an icon or text label.
