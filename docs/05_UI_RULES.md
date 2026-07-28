# UI Rules

## Authority order

1. `src/styles/druvio-design-system-v1.css` (loaded last)
2. Existing feature styles in `src/index.css` and `src/maps/mapScreen.css`
3. `DESIGN_SYSTEM.md`
4. This behavioral summary

If documents and computed CSS disagree, preserve current rendered behavior and update the docs.

## Foundations

| Token area | Rule |
|---|---|
| Font | `Inter, Roboto, "Segoe UI", system-ui, sans-serif` through `--ds-font` |
| Spacing | Only 4, 8, 12, 16, 24, 32 px design-system steps |
| Radius | 16 px standard, 8 px compact, pill only for chips/status |
| Motion | 120 ms fast, 200 ms standard, `cubic-bezier(.2,0,0,1)` |
| Elevation | Flat/bordered by default; minimal raised shadow for overlays/interactive cards |
| Primary | Trust blue `#1d4ed8`; buyer feature styling also uses established green overrides |
| Cashback/success | `#15803d` |
| Warning/error | `#a15c00` / `#b42318` |

New UI must consume `--ds-*` tokens or an established semantic alias.

## Components

- Buttons: Primary, Secondary, Text; use existing classes.
- Inputs: minimum 48 px height, 8 px radius, persistent label/accessible name, visible focus.
- Icons: Lucide outline, 24 px normal, 48 px touch container.
- Cards: bordered surface, 16 px padding; avoid decorative elevation.
- Property cards: image, name, location, price, status, focused actions.
- Chips/status: pill shape permitted; combine text/icon with color.
- Tables: neutral header and row borders; allow horizontal overflow on narrow screens.
- Dialogs/bottom sheets: scrim, focusable controls, explicit close, minimal elevation.
- Empty states: quiet bordered/centered surface with a relevant next action.
- Skeleton/loading: neutral; disable or guard duplicate submission.

## Role layouts

- Buyer: map-first canvas with desktop sidebar; Home/Map/Cashback bottom nav on Android-width layout.
- Seller: desktop sidebar and content panels; mobile bottom navigation.
- Admin: desktop sidebar; mobile drawer.
- Do not force one workspace's navigation pattern onto another.

## Responsive behavior

- Primary component breakpoint is 768 px; existing feature CSS also uses 360, 600/640, 720, 900/920, 1024, 1180/1200, and 1500 px.
- Reuse the nearest existing breakpoint for the component.
- Touch controls must remain usable at 360 px.
- Grids collapse before content clips; data tables may scroll horizontally.
- Map overlays must not hide navigation or primary project actions.

## States

| State | Required behavior |
|---|---|
| Loading | Communicate activity; prevent duplicate mutation |
| Empty | State why no records are shown and provide valid recovery/action |
| Error | Plain-language message, `role="alert"` where dynamic, retry/dismiss if meaningful |
| Success | `role="status"` or equivalent; do not rely on color alone |
| Disabled | Visually and semantically disabled; explain unavailable planned actions |
| Offline/map unavailable | Preserve non-map content and show configuration/service error |

## Accessibility

- Use semantic `button`, `input`, `nav`, `main`, headings, tables, and labels.
- All icon-only controls require accessible names.
- Visible keyboard focus is mandatory.
- Modals/drawers require modal semantics; Escape/return focus behavior should be preserved or improved.
- Respect `prefers-reduced-motion`.
- Do not rely on hover or color alone.
- TODO: Establish automated WCAG target/test harness; do not claim formal compliance yet.

## Content

- Use factual property data only.
- Format Indian currency with existing utilities.
- Status labels must reflect stored/canonical workflow state.
- Do not display fabricated view counts, scores, distances, verification, scarcity, or cashback.
- Unknown values use a neutral absence label, not a guessed default, unless an existing compatibility model explicitly defines one.

## Rules never to break

- Do not add a new visual system beside Druvio Design System v1.
- Do not use arbitrary spacing/colors/radii when tokens exist.
- Do not mix filled third-party icons with Lucide.
- Do not hide error or empty states to make a screen appear complete.
- Do not expose Admin/Seller controls to unauthorized roles.
- Do not mark documents verified unless stored data says so.
