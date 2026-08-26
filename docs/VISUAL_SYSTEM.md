# Yorkstead Visual System

## 1. Preservation Rule

Before any UI, layout, navigation, component, page, demo, or design-system change, inspect the existing Yorkstead.DEV application and treat its current visual identity as authoritative. Do not redesign the overall theme.

Preserve color behavior, typography, spacing philosophy, borders, radii, shadows, navigation, buttons, cards, forms, tables, icons, widths, motion, logo treatment, and overall personality. New work must look as though it has always belonged to the same company.

---

## 2. Provenance and Inspection Record

- **Source Reference**: Authoritative baseline established on 2026-08-24.
- **Brand Authority**:
  - Name: `Yorkstead Systems`
  - Platform: `Yorkstead Operations`
  - Wordmark: `YORKSTEAD`
  - Domain Suffix: ` SYSTEMS` (rendered in primary cyan)
  - Descriptor: `Industrial software and workflow automation`
  - Personality: Purpose-built, dense, high-contrast, confident, operator-first.

---

## 3. Authoritative Design Tokens

### Color Tokens (OKLCH Color Space)

| Token | Dark Theme (Default) | Light Theme | Usage |
| --- | --- | --- | --- |
| `--background` | `oklch(0.105 0.015 255)` | `oklch(0.975 0.004 255)` | Base canvas surface |
| `--foreground` | `oklch(0.95 0.006 255)` | `oklch(0.18 0.015 255)` | Primary high-contrast text |
| `--card` | `oklch(0.145 0.016 255)` | `oklch(0.995 0.002 255)` | Elevated panel / card surface |
| `--card-foreground` | `oklch(0.95 0.006 255)` | `oklch(0.18 0.015 255)` | Text on card surfaces |
| `--primary` | `oklch(0.72 0.18 215)` | `oklch(0.58 0.19 242)` | Restrained action cyan accent |
| `--primary-foreground` | `oklch(0.12 0.025 235)` | `oklch(0.99 0 0)` | Text on primary solid controls |
| `--secondary` | `oklch(0.19 0.017 255)` | `oklch(0.94 0.008 255)` | Secondary control surface |
| `--secondary-foreground` | `oklch(0.91 0.008 255)` | `oklch(0.24 0.02 255)` | Text on secondary controls |
| `--muted` | `oklch(0.19 0.017 255)` | `oklch(0.94 0.008 255)` | Subtle background fill |
| `--muted-foreground` | `oklch(0.63 0.02 255)` | `oklch(0.5 0.02 255)` | Secondary / supporting copy |
| `--accent` | `oklch(0.21 0.024 235)` | `oklch(0.925 0.018 242)` | Interactive hover & active highlight |
| `--accent-foreground` | `oklch(0.95 0.006 255)` | `oklch(0.22 0.025 255)` | Text on accent surfaces |
| `--border` | `oklch(0.24 0.018 255)` | `oklch(0.88 0.012 255)` | 1px low-contrast structural border |
| `--ring` | `oklch(0.72 0.18 215)` | `oklch(0.58 0.19 242)` | Accessible focus indicator outline |

### Typography Tokens

- **Sans Family**: `"Geist", "Geist Fallback", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Mono Family**: `"Geist Mono", "Geist Mono Fallback", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
- **Label Tracking**:
  - Wordmark tracking: `tracking-[0.24em]`
  - Metadata / Tag tracking: `tracking-[0.16em]`
  - Display heading tracking: `tracking-tight`

### Geometry, Radius and Elevation

- **Radius Baseline**: `--radius: 0.7rem` (~11px)
  - `--radius-sm`: `calc(var(--radius) * 0.75)` (~8px)
  - `--radius-md`: `calc(var(--radius) * 0.875)` (~10px)
  - `--radius-lg`: `var(--radius)` (~11px)
  - `--radius-xl`: `calc(var(--radius) * 1.5)` (~16px)
- **Borders**: Thin 1px borders (`border border-border`), avoiding decorative shadows.
- **Elevation Glow**: Primary action button subtle cyan glow `shadow-[0_0_24px_-8px_var(--primary)]`.

---

## 4. Component Pattern Inventory

1. **Brand Identity**:
   - `BrandMark`: Inline wordmark `Yorkstead` with `.DEV` cyan suffix, paired with optional uppercase mono descriptor separated by vertical border.
2. **Buttons**:
   - `default`: Primary cyan background with dark contrast text and subtle cyan glow.
   - `secondary`: Neutral dark slate surface with 1px border.
   - `outline`: Semi-transparent background with border, turning cyan on hover (`hover:border-primary/40`).
   - `ghost`: Muted foreground text, subtle accent background on hover.
3. **Cards & Containers**:
   - `Card`: `rounded-xl border border-border bg-card text-card-foreground p-5`.
4. **Badges & Status Chips**:
   - `Badge`: `inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium font-mono`.
5. **Form Controls**:
   - `Input` / `Select` / `Textarea`: `h-11 rounded-lg border border-border bg-background/70 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/15`.
6. **Data Grids & Tables**:
   - High density, tabular numeric alignment, sticky header rows, subtle horizontal dividing lines.

---

## 5. Non-Negotiable Constraints

- **Prohibited Aesthetics**: Do not introduce generic SaaS pastel palettes, heavy glassmorphism, oversized rounded pills, glowing AI orb effects, decorative placeholder charts, or unrelated font families.
- **Single Component System**: Extend the established UI primitives; do not import a secondary component library (e.g., MUI, Ant, Mantine).
- **Demo Isolation**: Demo organizations may customize company name, logo avatar, and one supported accent color, but cannot break global layout and typography rules.

---

## 6. Accessibility and Motion Standards

- **Focus Visibility**: `:focus-visible { outline: 2px solid var(--ring); outline-offset: 3px; }` mandatory across all interactive elements.
- **Selection**: `::selection { background: color-mix(in oklab, var(--primary) 35%, transparent); }`.
- **Reduced Motion**: `@media (prefers-reduced-motion: reduce)` sets animation and transition durations to `0.01ms !important`.
- **Viewport Constraints**: `max-width: 100%; overflow-x: clip;` with `padding-bottom: env(safe-area-inset-bottom);` for mobile browser chrome.
- **Touch Target Minimum**: 36px to 44px minimum touch target size on touch viewports.

---

## 7. Intentional Gaps & Future Operations Extensions

1. **Industrial Traveler Statuses**: High-contrast operational state badges (Ready, In-Progress, Paused, Blocked, Complete, Scrapped) to be codified in the ShopFloor module.
2. **Barcode / QR Scanner HUD**: Dedicated reticle styling for mobile shopfloor cameras.
3. **High-Density Data Grid Controls**: Operator density toggles (Standard vs. Compact) for high-volume inventory screens.

---

## 8. Verification

Compare every newly created UI element against these tokens and reference patterns. Completion reports must state:
*"No existing global visual identity was changed."*
