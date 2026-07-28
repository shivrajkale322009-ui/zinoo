# Druvio Design System v1

Druvio Design System v1 is the shared visual language for the desktop web application and Android experience. Its priorities are trust, calm hierarchy, low visual noise, and consistent one-hand interactions.

## Foundations

- Palette: neutral white surfaces, one trust blue, restrained cashback green, and semantic error/warning colors.
- Typography: Display, Heading, Title, Body, and Caption roles using Inter/Roboto/system fallbacks.
- Spacing: `4, 8, 12, 16, 24, 32px` only.
- Shape: `16px` standard radius and `8px` compact radius. Pill radius is reserved for chips and status indicators.
- Elevation: flat by default, borders for grouping, and one minimal raised shadow for overlays or interactive cards.
- Motion: 120ms fast and 200ms standard transitions using a Material-style easing curve. Reduced-motion preferences are respected.

## Components

- Buttons: Primary, Secondary, and Text only.
- Cards: bordered, flat surfaces with 16px internal spacing.
- Chips: compact pill controls using neutral, trust, or semantic state colors.
- Inputs: 48px minimum height, 8px radius, visible focus ring.
- Navigation: 64px top app bars and 80px Android bottom navigation.
- Dialogs: bordered surfaces with minimal elevation.
- Bottom sheets: the same dialog contract with bottom-only attachment on mobile.
- Tables: neutral header surface, simple row borders, no decorative striping.
- Property cards: image, title, location, price, status, and focused actions.
- Status indicators: success/cashback green, warning amber, error red, trust blue, or neutral.
- Icons: 24px standard, 48px touch container, outline style.
- Empty states: centered, bordered, quiet neutral surface.
- Skeletons: neutral loading blocks with reduced-motion support.

## Usage

The implementation lives in `src/styles/druvio-design-system-v1.css` and is imported after the legacy stylesheet so it remains the final visual authority. New components should consume `--ds-*` tokens directly and use existing shared component classes before adding feature-specific styles.
