---
name: TECH BRO
description: Neo-Brutalist press-proof design system for a developer-oriented collaboration platform.
colors:
  warm-paper: "#f5f0e8"
  pure-surface: "#ffffff"
  focus-paper: "#fffdf8"
  ink-black: "#171717"
  ink-muted: "#45413b"
  placeholder-ink: "#57534e"
  acid-lime: "#b8f56a"
  acid-lime-hover: "#a7eb50"
  signal-coral: "#ff8a65"
  electric-violet: "#a78bfa"
  error-crimson: "#b91c1c"
  error-tint: "#fef2f2"
typography:
  display:
    fontFamily: "Space Grotesk, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2.85rem, 4.5vw, 4.35rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Space Grotesk, system-ui, -apple-system, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Space Grotesk, system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "Space Grotesk, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.01em"
  sticker:
    fontFamily: "Space Grotesk, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.06em"
rounded:
  xs: "2px"
  sm: "3px"
  md: "4px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.acid-lime}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.acid-lime-hover}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  button-surface:
    backgroundColor: "{colors.pure-surface}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
    height: "50px"
  input-default:
    backgroundColor: "{colors.pure-surface}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
    height: "48px"
  card-primary:
    backgroundColor: "{colors.pure-surface}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.md}"
    padding: "32px"
---

# Design System: TECH BRO

## Overview

**Creative North Star: "The Tactile Press-Proof Studio"**

TECH BRO speaks in Neo-Brutalism built for working software teams: crisp black ink outlines, zero-blur hard offset shadows, warm drafting-paper grounds, and high-contrast geometric fills that behave like physical print stamps rather than soft SaaS chrome. Every control communicates affordance through border weight, shadow depth, and mechanical press displacement—never through translucency, blur, or ambient glow.

The system balances bold studio personality on brand surfaces with strict operational clarity inside interactive slabs. Brand panels anchor identity with intentional asymmetry, architectural registration marks, and geometric workflow diagrams, while functional forms strip back to pure white elevated slabs where Acid Lime owns the primary action unchallenged.

**Key Characteristics:**
- Heavy `#171717` ink outlines (`2px` controls, `3px` slabs and architectural dividers) across every container and control.
- Zero-blur hard offset shadows that step physically on hover (`6px`) and press (`1px`), with `prefers-reduced-motion` preserving color/state feedback without translation.
- Full-contrast Space Grotesk typography pairing tight stacked display headlines with readable medium-weight form labels and controls.
- Warm drafting-paper ground (`#F5F0E8`) contrasted with a subtle 32px architectural registration grid behind elevated work slabs.

## Colors

A high-contrast, light-ground Neo-Brutalist palette where warm drafting paper and pure white slabs carry heavy black ink, punctuated by Acid Lime, Signal Coral, and Electric Violet.

### Primary
- **Acid Lime** (`--tb-primary`): Reserved for the primary CTA (`LET'S GO!`), checked checkbox fill, `TB` brand monogram, `LEVEL UP.` stamp, and text selection highlight.
- **Acid Lime Hover** (`--tb-primary-hover`): Active hover shift for primary buttons without losing `#171717` AAA text contrast.

### Secondary
- **Signal Coral** (`--tb-secondary`): Used for secondary brand stickers (`SHIP FAST`), architectural registration blocks, and geometric workflow accents. Never used as text color on white.

### Tertiary
- **Electric Violet** (`--tb-accent`): Used for architectural corner blocks, developer badges (`BUILT FOR DEVS`), and workflow stage highlights paired strictly with `#171717` ink.

### Neutral
- **Warm Paper** (`--tb-bg`): Global page canvas and brand pane ground.
- **Pure Surface** (`--tb-surface`): Elevated form cards, inputs, secondary buttons, and workflow frames.
- **Focus Paper** (`--tb-surface-focus`): Subtle warm tint on active focused inputs.
- **Ink Black** (`--tb-ink`): Primary text, borders, icons, and hard offset shadow color.
- **Ink Muted** (`--tb-ink-muted`): Supporting copy and secondary descriptions (≥ 9:1 on warm paper, ≥ 7.8:1 on white).
- **Placeholder Ink** (`--tb-placeholder`): Input placeholder text meeting WCAG AA (≥ 6.5:1 on white).
- **Error Crimson** (`--tb-error`) & **Error Tint** (`--tb-error-bg`): Accessible inline form validation errors and invalid input highlights.

### Named Rules
**The Primary Exclusivity Rule.** Inside any functional card or form slab, Acid Lime belongs exclusively to the single primary action and active binary states (checked checkbox, success confirmation). Secondary buttons stay Pure Surface so the primary action is unmistakable at a glance.

**The Dark-Ink-Only Rule.** Signal Coral, Acid Lime, and Electric Violet are always paired with Ink Black (`#171717`) foregrounds—never white text and never used as body text color on white surfaces.

## Typography

**Display Font:** Space Grotesk (fallback: `system-ui, -apple-system, sans-serif`)
**Body Font:** Space Grotesk (fallback: `system-ui, -apple-system, sans-serif`)

**Character:** Geometric, punchy, and unmistakably technical without resorting to decorative monospace costumes. Tight display tracking and uppercase stamps create poster authority, while medium-weight sentence case keeps forms effortless to scan.

### Hierarchy
- **Display** (`700`, `clamp(2.85rem, 4.5vw, 4.35rem)` desktop / `26px–36px` mobile-tablet, `0.98–1.06` line-height, `-0.035em` tracking): Brand poster headlines (`BUILD. CONNECT. LEVEL UP.`).
- **Headline** (`700`, `26px–32px`, `1.1` line-height, `-0.025em` tracking): Primary card and surface headings (`Welcome Back!`).
- **Body** (`500`, `14px–18px`, `1.45–1.55` line-height): Supporting descriptions (`max-w-[36ch]` with `text-balance`) and form input values.
- **Label** (`700`, `14px`, `1.25` line-height): Persistent form field labels and control actions.
- **Sticker / Divider Badge** (`700`, `11px–12px`, `0.06em–0.08em` tracking, uppercase): Geometric developer tags and framed separator labels.

### Named Rules
**The Zero-Eyebrow Rule.** Headings stand on their own weight. Never stack small uppercase kicker/eyebrow labels above primary or card headings.

## Layout

Split-screen architectural grid (`1.06fr / 0.94fr`) on desktop (`≥1024px`) capped at `1600px` max width and anchored by a `3px` vertical ink rule separating the solid warm-paper brand pane from the 32px drafting-grid workspace pane. Below `1024px`, layout switches to a single-column `grid-rows-[auto_1fr]` flow: tablet (`640px–1023px`) pairs a compact brand header + architectural corner notch + two stickers above the centered login card, while mobile (`<640px`) tightens the brand header and card spacing (`20px` card padding, `14px` field gap) so the entire login flow and primary CTA fit inside a single `390×844` viewport with zero horizontal overflow.

## Elevation & Depth

Depth is expressed strictly through zero-blur solid ink offset shadows (`#171717`) paired with `2px`–`3px` solid ink borders. No blur radii, no glassmorphism, and no ambient halos exist in this system.

### Shadow Vocabulary
- **Pressed** (`--tb-shadow-pressed`: `1px 1px 0px #171717`): Active mouse/key press state on buttons.
- **Extra Small** (`--tb-shadow-xs`: `2px 2px 0px #171717`): Resting inputs, checked checkboxes, disabled buttons, and compact notices.
- **Small** (`--tb-shadow-sm`: `4px 4px 0px #171717`): Resting buttons, focused inputs, and tilted developer stickers.
- **Medium** (`--tb-shadow-md`: `6px 6px 0px #171717`): Hovered buttons, workflow diagrams, and desktop display stamps.
- **Large** (`--tb-shadow-lg`: `8px 8px 0px #171717`): Primary elevated slabs (Login Card).
- **Error** (`--tb-shadow-error`: `3px 3px 0px #b91c1c`): Invalid form inputs.

### Named Rules
**The Mechanical Press Rule.** Interactive Neo-Brutalist buttons translate opposite their shadow on hover (`-2px, -2px` lifting to `6px` shadow) and press into their shadow on active (`+3px, +3px` dropping to `1px` shadow). Under `prefers-reduced-motion: reduce`, translation disables while crisp background/border feedback remains.

## Shapes

Sharp, near-square geometry (`2px` badges/checkboxes, `3px` buttons/inputs, `4px` primary slabs) with `0px` corners on architectural corner blocks and workflow diagram containers. Custom SVG icons share uniform `2.25px–2.75px` strokes with `strokeLinecap="square"` and `strokeLinejoin="miter"`. Intentional slight tilts (`-1deg` to `+1deg`) are reserved strictly for brand stamps and stickers—never functional inputs or cards.

## Components

Tactile, unambiguous, high-contrast components engineered for keyboard, mouse, and touch (`≥44×44px` hit targets throughout).

### Buttons
- **Shape:** Near-square (`3px` radius) with `2px` solid `#171717` border and `50px` desktop height (`48px` mobile).
- **Primary:** Acid Lime (`--tb-primary`) fill, Ink Black bold uppercase text (`0.04em` tracking), `4px` hard shadow at rest.
- **Hover / Focus:** Lifts `-2px` to `6px` shadow on hover (`--tb-primary-hover`); presses `+3px` to `1px` shadow on active; solid `3px` `#171717` `focus-visible` outline with `3px` offset.
- **Loading / Disabled:** Disabled buttons drop into `2px` offset at `75%` opacity; loading state swaps label for stepping square pulse dots (`ENTERING WORKSPACE...`) with `aria-busy="true"`.
- **Surface (Secondary):** Pure White (`--tb-surface`) fill with `2px` black border and identical press physics (`Add Account`, `Cancel`).

### Cards / Containers
- **Corner Style:** Minimal brutalist corner (`4px` radius).
- **Background:** Pure Surface (`#FFFFFF`) over the 32px Warm Paper drafting grid.
- **Shadow Strategy:** Large hard offset shadow (`--tb-shadow-lg`).
- **Border:** Full `3px` solid `#171717` border on all four sides (never one-sided accent bars).
- **Internal Padding:** `20px` mobile / `32px` tablet and desktop.

### Inputs / Fields
- **Style:** `2px` solid `#171717` border, Pure Surface background, `3px` radius, `46px–48px` height, persistent `14px` bold label above, `2px` resting shadow.
- **Focus:** Shifts to `--tb-surface-focus` with `4px` hard offset shadow and explicit solid `3px` `#171717` `focus-visible` ring (`2px` offset).
- **Error / Disabled:** `2px` Error Crimson border, Error Tint fill, crimson hard shadow (`--tb-shadow-error`), and inline alert message with custom geometric warning icon (`role="alert"`, `aria-invalid`, `aria-describedby`).

### Chips / Stickers
- **Style:** `2px` solid `#171717` border, `2px` radius, `4px` hard shadow, uppercase `12px` bold Space Grotesk with `0.06em` tracking, paired with square-stroke SVG icon.
- **State:** Static brand accents in Signal Coral (`SHIP FAST`) and Electric Violet (`BUILT FOR DEVS`), capped at two stickers per brand pane to preserve hierarchy.

### Custom Checkbox
- **Style:** `20×20px` visual box inside a `44px` minimum touch target, `2px` solid `#171717` border, `2px` radius; fills Acid Lime with bold black SVG checkmark and `2px` hard shadow when checked.

## Do's and Don'ts

### Do:
- **Do** use `--tb-*` CSS custom properties for every color and hard offset shadow so tokens stay unified across screens.
- **Do** keep all interactive touch targets at `≥44×44px` and pair every focusable element with a solid `3px` `#171717` `focus-visible` outline.
- **Do** use custom square-cap SVG icons and SVG `<pattern>` hatches instead of CSS gradient stripes or emojis.
- **Do** keep mobile brand chrome compact so primary operational forms fit cleanly within the first `390×844` viewport.

### Don't:
- **Don't** introduce glassmorphism, backdrop blur, blurry drop shadows, gradient fills, or pill-rounded (`>4px`) containers.
- **Don't** place kicker/eyebrow labels above headings or one-sided accent bars on card edges.
- **Don't** scatter Acid Lime across decorative badges when a primary CTA is present on screen.
- **Don't** render Signal Coral or Electric Violet as text color on white surfaces.
