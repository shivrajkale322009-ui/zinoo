# Admin UI audit and redesign principles

## Product and users

The back office supports one permission model with three cumulative roles:

- Buyer: consumer discovery and account activity.
- Seller: listings, leads, visits, cashback requests, and developer profile management.
- Admin: all buyer and seller permissions plus property governance, seller approval, cashback review, account management, buyer-home content, amenities, and managed seller access.

There is no separate super-admin, finance, or operations permission in the current code. Those responsibilities are combined in the admin role.

## Admin architecture

The admin module is state-driven inside `AdminPanel` rather than route-driven. Its destinations are:

- Overview: Dashboard and AI Assistant.
- Operations: Properties, Property Reviews, Seller Requests, and Cashback Management.
- Accounts: Buyers and Sellers.
- Content: Feed and Featured Developers.
- Workspace: Profile and Settings.

Shared workflows include property details/editor, media/document management, cashback details and review, account profile views, confirmation modals, mobile navigation drawer, notification/profile menus, status messages, empty states, and loading/working states.

## Primary jobs and information hierarchy

| Screen | Primary job | Tier 1 | Tier 2 | Tier 3 |
| --- | --- | --- | --- | --- |
| Dashboard | Triage work requiring attention | Pending seller/property/cashback work | Live account/listing totals | Activity summaries |
| Properties | Find and govern a property | Name, location, status, health, seller link | ID and update date | Destructive/rare actions |
| Property reviews | Approve or reject submissions | Project, seller, verification state, actions | Land and location metadata | Active inventory reference |
| Seller requests | Approve or reject applicants | Applicant, business, contact, actions | Pending status | Historical detail |
| Buyers | Find a buyer quickly | Name and phone | Role | Enquiry-linked properties |
| Sellers | Find/manage a seller | Business/name, phone, property count, workspace action | Email and status | Associated property detail |
| Cashback | Review and progress claims | Request, parties, property, amount, status | Submission time and proof | Payment metadata/history |
| Feed/developers | Curate buyer-home content | Current published items and ordering | Visibility metadata | Creation internals |
| Settings | Configure shared catalogs/preferences | Amenities and appearance | Support | Rare maintenance actions |

## CSS architecture findings

At audit time `src/index.css` contained 19,507 lines, 73 separate `max-width: 768px` media blocks, 431 `!important` declarations, 2,873 hardcoded hex-color occurrences, 21 negative-margin declarations, 45 fixed-position rules, 129 absolute-position rules, and 163 z-index declarations.

The recurring failures are:

- Multiple generations of responsive rules remain active simultaneously.
- The cascade relies on file order and deeply nested selectors instead of component ownership.
- Global seller/admin page gutters conflict with editor-local width and padding.
- Shared names such as `.badge`, `.btn-primary`, `.admin-panel-section`, and `.table-container` receive unrelated overrides.
- Mobile behavior is often added as a late patch rather than designed at the component boundary.
- Inline styles encode presentation inside workflow markup.
- Tokens exist, but many later rules bypass them with one-off colors, radii, and spacing.

## Design-system decisions

- Blue is the only primary action/accent color.
- Semantic green, amber, red, and cyan are reserved for feedback/status.
- Spacing uses 4, 8, 12, 16, 24, 32, and 40px.
- Control heights are 40px compact and 44px standard; mobile touch targets are at least 44px.
- Radii are 8px controls, 12px cards, and pill only for statuses.
- Surfaces use borders first and shadows only for floating/elevated UI.
- Desktop content is capped for readable density; mobile content uses a single 16px page gutter except intentionally edge-to-edge structural regions.
- Every destination has one page title and a short task-oriented description.
- Tables are retained for desktop comparison tasks; mobile approval workflows use compact review cards rather than horizontally scrolling tables.

## Priority

- P0: conflicting page gutters and unstable editor width model.
- P1: fragmented admin foundation, duplicated page hierarchy, crowded navigation, desktop tables on mobile review screens.
- P2: inconsistent controls, status treatments, cards, empty states, and page spacing.
- P3: residual one-off component polish and obsolete legacy rules.

