# Design System Strategy: The Modern Angler’s Ledger

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Refined Expedition."** We are moving away from the "utilitarian plastic" look of typical outdoor apps and toward the tactile, storied feel of a high-end vintage ledger or a handcrafted fly-fishing kit.

This system breaks the "template" look by rejecting rigid, boxed-in grids in favor of **intentional asymmetry** and **tonal layering**. We treat the screen not as a flat digital plane, but as a series of physical materials—heavy paper, oiled leather, and dark forest depths. By using high-contrast typography scales and overlapping elements, we create a layout that feels curated and editorial rather than programmed.

## 2. Colors & Materiality
The palette is rooted in the earth, using deep forest tones and oxidized oranges to evoke a sense of heritage and reliability.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections. We do not "box" content. Boundaries must be defined exclusively through:
*   **Background Color Shifts:** A `surface-container-low` card sitting on a `surface` background.
*   **Subtle Tonal Transitions:** Using depth to imply containment.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials.
*   **Base:** `surface` (#fcf9f8) acts as our "fine paper" canvas.
*   **Elevated Content:** Use `surface-container-low` (#f6f3f2) for secondary modules.
*   **Primary Focus:** Use `surface-container-lowest` (#ffffff) for high-importance cards to create a "lifted" effect without heavy shadows.

### The "Glass & Gradient" Rule
To prevent a "flat" feel, use **Glassmorphism** for floating headers or navigation bars. Apply a `surface` color at 80% opacity with a `20px` backdrop-blur. This allows the rugged colors of map data or photography to bleed through, softening the interface.
*   **Signature Textures:** Use a subtle linear gradient on primary CTAs, transitioning from `primary` (#18301d) to `primary_container` (#2e4632) at a 155-degree angle to mimic the sheen of forest light.

## 3. Typography
Our typography is a dialogue between the tradition of the hunt and the precision of modern navigation.

*   **The Voice (Display & Headline):** **Newsreader.** This sturdy serif brings the "vintage badge" character. Use `display-lg` (3.5rem) for hero moments with tight tracking (-0.02em) to feel authoritative and editorial.
*   **The Engine (Title, Body, Labels):** **Work Sans.** A highly legible, modernist sans-serif. It provides the "professional" counterbalance to the serif’s heritage feel.
*   **Hierarchy Note:** Use `title-md` in `secondary` (#9f4215) for sub-headers to provide a warm, "burnt orange" trail-marker effect that guides the eye through dense fishing logs.

## 4. Elevation & Depth
In this system, depth is a result of light and material, not artificial lines.

*   **The Layering Principle:** Stack your surfaces. A `surface-container-highest` navigation element should sit atop a `surface-container-low` page body. This "tonal nesting" creates a sophisticated, architectural feel.
*   **Ambient Shadows:** If an element must float (e.g., a "New Catch" FAB), use an extra-diffused shadow: `box-shadow: 0 12px 32px rgba(27, 28, 28, 0.06)`. Note the use of `on_surface` for the shadow tint—never use pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline_variant` (#c3c8c0) at **15% opacity**. It should be felt, not seen.

## 5. Components

### Buttons: The Tactile Tool
*   **Primary:** `primary` (#18301d) background with `on_primary` text. `0.375rem` (md) corners. Apply the signature gradient.
*   **Secondary:** `tertiary_fixed` (#f3e0c0) background. It feels like aged tan leather.
*   **Tertiary:** No background. `title-sm` weight, using `primary` color with a small icon suffix.

### Cards: The Logbook Entry
Cards must never have borders. Use `surface-container-low` and `xl` (0.75rem) rounded corners. Forbid the use of divider lines; separate content using `1.5rem` of vertical white space or a subtle shift to `surface-container-highest` for the card footer.

### Inputs: The Field Notes
Text fields use a `surface-container-high` fill. Instead of a 4-sided border, use a 2px bottom-bar in `outline` (#737971) that transitions to `secondary` (#9f4215) on focus. This mimics the "underline" of a handwritten ledger.

### Bespoke App Components
*   **The "Tackle Box" Filter:** A horizontal scrolling list of `Chips` using `surface-variant` backgrounds and `newsreader` labels.
*   **Depth Gauges:** Vertical progress bars using a gradient from `primary` to `secondary` to visualize water depth or catch probability.

## 6. Do’s and Don’ts

### Do
*   **Do** embrace white space. Treat the screen like a premium magazine layout.
*   **Do** use asymmetrical image crops (e.g., one rounded corner at `xl` and three at `md`) to break the "app" feel.
*   **Do** use `secondary` (burnt orange) sparingly as a "high-alert" or "pathfinding" accent.

### Don't
*   **Don't** use pure black (#000000). Use `charcoal grey` (`on_background` #1b1c1c) for all dark text to maintain the organic, outdoorsy warmth.
*   **Don't** use 1px dividers. If you need to separate elements, use a `surface-variant` horizontal rule that only spans 60% of the container width, centered.
*   **Don't** use "Default" shadows. If it looks like a standard shadow, it’s too heavy. Lighten it until it's almost gone.