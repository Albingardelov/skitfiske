# Design System Specification: The Refined Expedition

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Field Journal."** 

We are moving away from the "app-as-a-utility" aesthetic and toward a high-end, editorial experience that mirrors a premium physical artifact. This system rejects the rigid, boxy constraints of standard mobile frameworks in favor of **Organic Editorialism**. By utilizing intentional asymmetry, overlapping elements, and high-contrast typography scales, we create a sense of professional heritage. The goal is to make the user feel like they are interacting with a curated expedition log rather than a generic database.

## 2. Colors: Tonal Depth & The "No-Line" Rule
This system utilizes a sophisticated Material Design 3 token logic, but interprets it through a nature-inspired lens. 

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts or subtle tonal transitions. 
- Separation is achieved by placing a `surface-container-low` section against a `surface` background. 
- In outdoor, high-glare conditions, contrast is maintained through these broad tonal blocks rather than thin lines that disappear in the sun.

### Surface Hierarchy & Nesting
Treat the UI as physical layers—stacked sheets of heavy-weight paper or frosted forest glass. 
- **Base Layer:** `surface` (#121414 in Dark / #F6F3F2 in Light).
- **Secondary Depth:** `surface-container` (#1f2020) for primary content areas.
- **Accents:** Use `primary-container` (#26482f) for interactive zones to provide a "recessed" feel.

### The "Glass & Gradient" Rule
To elevate the "Refined" aspect of the brand, floating elements (like navigation bars or hovering action buttons) must use **Glassmorphism**. 
- Apply `surface` colors at 85% opacity with a `20px` backdrop-blur.
- **Signature Textures:** Main CTAs should never be flat. Apply a subtle linear gradient (Top-Left to Bottom-Right) from `primary` (#a9d0af) to `primary-container` (#26482f) to give buttons a tactile, metallic sheen reminiscent of high-end outdoor gear.

## 3. Typography: Editorial Authority
The typographic pairing is a tension between the traditional and the functional.

*   **Headings (Newsreader):** This serif provides the "Journal" feel. Use `display-lg` and `headline-md` with tighter letter-spacing (-0.02em) to evoke a premium masthead.
*   **Body (Work Sans):** A high-legibility sans-serif chosen for functional data. It provides the "Professional" counterweight to the rugged Newsreader.

**Brand Identity through Scale:**
We use extreme scale contrast. A `display-sm` Newsreader headline should sit proudly above a `body-md` Work Sans description. This hierarchy signals that while the app is a tool, the *experience* is an expedition.

## 4. Elevation & Depth
We eschew traditional "drop shadows" for **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural "lift" that feels integrated into the environment.
*   **Ambient Shadows:** If an element must float (e.g., a modal), use a shadow color tinted with the `on-surface` hue at 6% opacity, with a blur radius of at least `32px`. Avoid pure black shadows; they feel "digital" and cheap.
*   **The Ghost Border Fallback:** If accessibility requirements demand a container boundary, use a "Ghost Border": `outline-variant` at 15% opacity. Never use 100% opaque borders.

## 5. Components: Rugged Precision

### Buttons (Tactile Targets)
*   **Primary:** Gradient fill (`primary` to `primary-container`). Height: 56px (Large touch target). Roundedness: `md` (0.375rem) to maintain a structural, rugged look.
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
*   **Tertiary:** Newsreader `title-sm` text with a subtle `accent-rust` (#9F4215) underline.

### Cards & Lists
*   **Rule:** Forbid divider lines.
*   **Implementation:** Use vertical white space from our spacing scale (16px, 24px) to separate items. For lists, use alternating background tints of `surface` and `surface-container-low`.
*   **Interactions:** On press, a card should shift from `surface-container` to `surface-bright`.

### Inputs & Fields
*   **Style:** Underlined fields only, or "Plinth" style (a subtle `surface-container-high` block). Avoid "pill-shaped" inputs; use the `DEFAULT` roundedness (0.25rem) for a more architectural, professional feel.
*   **States:** Error states use `error` (#ffb4ab) but must be accompanied by an icon for outdoor accessibility.

### Custom Component: The "Expedition Gauge"
A specialized data visualization component for Skitfiske. Use `tertiary` (Rust) for progress indicators against a `primary-container` track. This creates a high-contrast, "instrument-panel" aesthetic.

## 6. Do’s and Don’ts

### Do
*   **Do** embrace negative space. High-end design breathes.
*   **Do** use asymmetrical layouts (e.g., staggering image heights in a gallery) to break the "grid" feel.
*   **Do** ensure `on-surface` text meets AA contrast ratios against all `surface-container` tiers for sunlight readability.

### Don’t
*   **Don’t** use pure black (#000000) or pure white (#FFFFFF). Use the provided surface tokens to maintain tonal depth.
*   **Don’t** use "Standard" Material ripples. Use a sophisticated "fade-in" highlight for touch states.
*   **Don’t** use icons thinner than 2pt. Outdoor conditions require "rugged" iconography that stands up to glare.