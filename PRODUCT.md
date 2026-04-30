# Product

## Register

brand

The primary surface is the marketing site (`/`, `/how-it-works`, `/specialties`, `/security`, `/doctors`). The dashboards (`/dashboard/*`) are a product surface but secondary scope for this engagement.

## Users

**Primary:** adults aged 28–55 in the US, comfortable enough with the web to book doctor visits online, who have been let down by traditional clinics (waiting rooms, insurance hoops, 15-minute visits) and by first-generation telemedicine (chat-only, formulaic upsells, no continuity of care).

**Context of use:** evening hours on a phone or laptop, often after the user has tried to self-diagnose. Mood is somewhere between mildly anxious and irritated. They are deciding in 30 seconds whether this site looks like another clinical-teal SaaS or like a real clinic.

**Job to be done:** "I have a symptom or a refill. Show me a real licensed doctor I can talk to tonight, on a flat fee, with a prescription I can fill the same day."

**Secondary user:** clinicians (doctor / pharmacist) browsing the marketing site to decide whether the platform is professional enough to apply.

## Product Purpose

Vellum Health is a flat-fee, video-first telemedicine clinic with same-day pharmacy fulfilment and field-level encrypted records. It exists to remove the three drains on a routine doctor visit: insurance friction, waiting rooms, and prescription forgery. Success is the user finishing the booking flow on the first visit and feeling the same calm they would feel walking into a designer-led private practice — not a SaaS funnel.

## Brand Personality

**Three words:** clinical, efficient, modern — but delivered through editorial typography rather than the visual clichés of healthcare SaaS.

**Voice:** precise, unhurried, occasionally wry. Says exactly what the product does. Never markets emotion at the user ("Your wellness journey starts here"). Italic-serif accents are the only place warmth shows.

**Tone goals:** confident without being chest-puffing; clinical without being cold; designer without being unserious.

## Anti-references

Match-and-refuse list. If a design choice could be at home in any of these, rework it.

- **Generic telemedicine SaaS** (Hims, Ro, Teladoc-style): clinical-teal accents, soft-shadow rounded cards, gradient CTAs, stock photos of smiling models, "Get started in seconds" hero.
- **Hospital-corporate**: navy + white, all-sans-serif, blue ribbons, "Care that puts you first" stock copy, sterile photography.
- **Wellness-startup pastel**: mint/peach gradients, blob illustrations, rounded-everything, "Your journey to wellness", soft-friendly anthropomorphic mascots.
- **Crypto/AI dark-mode reflex**: neon-on-black, glow effects, animated gradients, "Powered by AI" badges.

## Strategic Design Principles

1. **Editorial over SaaS.** The page should look closer to a print magazine spread than to a product landing page. Long measure, deep margins, hairline rules, opinionated typography.
2. **Italic accent is the whole brand.** The Fraunces italic-serif fragment inside a sans/serif headline is the recurring signature. Use it once per surface, not five times.
3. **Hairline grids over cards.** Most "card" containers in this codebase are gap-px borders on a tinted surface, not boxed cards with shadows. Keep it that way.
4. **Mono is for evidence, not decoration.** JetBrains Mono is reserved for clinical IDs, fee values, prescription codes, and audit trails — never headings or marketing copy.
5. **No insurance-of-feeling.** The marketing surface never simulates emotion. It says what happens, in what order, for what flat fee, signed by whom.

## Accessibility & Inclusion

- WCAG 2.1 AA at minimum. All ink-on-paper combinations must clear 4.5:1; eyebrow / mute text 3:1 on the warm-bone background.
- Italic-accent color (`#6D3F8E` on `#F6F2E9`) must be verified against the headline weight at the size used, never relied on as the only signal.
- Reduced-motion respected for the `motion/react` page transitions and any in-view fades.
- Keyboard-only path through the booking flow must be unbroken.
- Forms remain usable down to 320px viewport width.
