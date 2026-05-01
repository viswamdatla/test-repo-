# Design System Strategy: The Curated Academic

## 1. Overview & Creative North Star
The "Curated Academic" is our Creative North Star. For a School Kit Management platform, we must move beyond the "clunky database" aesthetic. Instead, we treat every kit, student, and inventory item as a curated object in a high-end editorial gallery. 

This system breaks the "enterprise template" look by utilizing **Intentional Asymmetry** and **Tonal Depth**. We prioritize breathing room over information density, ensuring the user feels a sense of calm and control. By layering surfaces rather than boxing them in, we create a UI that feels like a physical workspace—clean, organized, and premium.

---

## 2. Colors: Tonal Architecture
We use a sophisticated Material-based palette to replace "flat" design with "dimensional" design.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Traditional borders create visual noise and "trap" the eye. Instead, define boundaries through background shifts. A `surface-container-low` section sitting on a `surface` background provides all the separation a user needs without the cognitive load of lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested, physical layers:
- **Base Layer:** `surface` (#fbf9f8) - The foundational "desk" everything sits on.
- **Sectioning:** `surface-container-low` (#f6f3f2) - For grouping related content areas.
- **Interactive Cards:** `surface-container-lowest` (#ffffff) - To create a natural "pop" against the background.
- **Elevated Modals:** `surface-bright` (#fbf9f8) - Reserved for the highest level of focus.

### The "Glass & Gradient" Rule
To inject "soul" into the School Kit experience:
- **Main CTAs:** Use a subtle linear gradient from `primary` (#005da7) to `primary_container` (#2976c7). This adds a soft, tactile curvature to buttons.
- **Floating Navigation:** Utilize Glassmorphism. Apply `surface_container_lowest` at 80% opacity with a `24px` backdrop-blur. This makes the UI feel light and modern, letting the school's brand colors bleed through softly.

---

## 3. Typography: Editorial Authority
We pair two distinct typefaces to balance character with utility.

*   **Display & Headlines (Manrope):** Use Manrope for all `display` and `headline` roles. Its geometric yet friendly curves provide an authoritative, editorial feel.
*   **Body & Utility (Inter):** Use Inter for all `title`, `body`, and `label` roles. Inter is the gold standard for readability in data-heavy management systems.

**Scale Philosophy:** 
We use a "High-Contrast" scale. Our `display-lg` (3.5rem) is intentionally massive to create a clear entry point on a page, while `body-md` (0.875rem) remains crisp for inventory details. This contrast creates a rhythmic flow that guides the user's eye from the "Big Picture" to the "Fine Print."

---

## 4. Elevation & Depth: Tonal Layering
We eschew the 2010s "Drop Shadow" for a more naturalistic approach.

*   **The Layering Principle:** To lift a School Kit card, place it (`surface-container-lowest`) on top of a `surface-container` background. The subtle shift in hex code creates a "soft lift" that is felt rather than seen.
*   **Ambient Shadows:** For floating elements (like dropdowns), use a custom shadow: `0px 12px 32px rgba(27, 28, 28, 0.06)`. By tinting the shadow with our `on_surface` color at a very low opacity, we mimic natural light.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline_variant` at 20% opacity. This creates a "suggestion" of a border that disappears into the background.
*   **Glassmorphism:** Use for persistent headers or sidebars to keep the layout feeling integrated.

---

## 5. Components: Tactile Utility

### Buttons & Chips
*   **Primary Button:** Uses the `xl` (1.5rem) roundedness scale. It should feel like a smooth pebble. Background: `primary` to `primary_container` gradient.
*   **Chips:** Use `full` roundedness. For School Kit status (e.g., "In Stock"), use `secondary_container` with `on_secondary_container` text. **No borders.**

### Input Fields
*   **Text Inputs:** Use `surface_container_highest` as the fill color. On focus, transition to `surface_container_lowest` with a 2px `primary` bottom-bar only. This avoids the "boxed-in" feel of traditional inputs.

### Cards & Lists
*   **The "No-Divider" Rule:** Forbid the use of horizontal lines in lists. Instead, use a `1.5rem` (xl) vertical spacing gap between items or alternating subtle background tints (`surface-container-low` vs `surface-container-lowest`).
*   **Kit Management Cards:** Apply `lg` (1rem) roundedness. Content should be padded heavily (24px - 32px) to emphasize the premium "School Kit" branding.

### Platform-Specific Components
*   **The Progress Track:** Use a thick `8px` bar with `surface_container_highest` as the track and a `primary` gradient for the fill. Rounded ends are mandatory.
*   **Status Toggles:** Should be oversized and use the `primary_fixed` color for the "off" state and `primary` for the "on" state to ensure visual comfort.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a functional tool. If a screen feels cluttered, increase the gap between containers rather than adding a border.
*   **DO** use `tertiary` (#7f5300) sparingly for "Warning" or "Action Needed" states—it provides a sophisticated alternative to jarring orange/reds.
*   **DO** use `surface-container-highest` for "hover" states on list items to create a tactile response.

### Don't
*   **DON'T** use pure black (#000000) for text. Always use `on_surface` (#1b1c1c) to maintain the soft, high-end editorial tone.
*   **DON'T** use the `none` or `sm` roundedness scales. This system is built on "Soft Minimalism"; sharp corners break the brand's approachability.
*   **DON'T** stack more than three layers of surfaces. If you need more depth, use a Backdrop Blur rather than a fourth grey tone.