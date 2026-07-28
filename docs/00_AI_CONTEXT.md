# Druvio AI Context

> Start every coding task here. This file is an index and operating contract; detailed facts live in the linked documents.

## Product

- Druvio is an authenticated, role-based real-estate PWA for discovering and managing land/plot projects.
- Current geographic copy and defaults are Pune/Chakan-oriented. Do not generalize coverage without a requirement.
- Roles are cumulative permissions:
  - Buyer: discover active projects, book visits, submit and track cashback requests.
  - Seller: buyer access plus manage owned projects, leads, visits, and assigned cashback requests.
  - Admin: all views plus seller approval, property review/lifecycle, user oversight, feed banners, and managed-seller workspaces.
- Core philosophy: buyer-visible inventory must be explicitly active; seller ownership must remain attributable; sensitive lifecycle transitions must be server-authoritative and auditable.

## Technical stack

| Area | Current implementation |
|---|---|
| Client | React 18, JavaScript/JSX, Vite 5 |
| Backend | Firebase callable Cloud Functions, Node.js 20 |
| Identity | Firebase Authentication: Google and phone OTP |
| Data | Cloud Firestore database ID `default`, real-time listeners |
| Files | Firebase Storage |
| Maps | Google Maps JavaScript API in the active buyer map; Leaflet remains installed and `BuyerMap.jsx` is legacy/not mounted |
| UI | CSS, Lucide React, Druvio Design System v1 |
| Hosting | Firebase Hosting, SPA rewrite to `index.html`, PWA manifest/service worker |
| Tests | Node built-in test runner for `src/**/*.test.js` |

## Repository map

```text
src/
  App.jsx                  authentication, permissions, role routing, shared listeners
  firebaseConfig.js        only Firebase client initialization point
  components/              buyer, seller, admin, auth, profile, feed, cashback, property UI
  maps/                    active Google map, layouts, geometry, map UI
  styles/                  Druvio Design System v1 override layer
  utils/                   domain normalization and calculations
functions/
  index.js                 callable functions and authoritative workflows
  propertyStatus.json      canonical property status vocabulary
public/                    PWA manifest, icons, service worker
docs/                      project source of truth
firestore.rules            database authorization and validation
firestore.indexes.json     deployed composite indexes
storage.rules              upload/read authorization and limits
firebase.json              hosting, functions, Firestore, and Storage configuration
```

## Architecture in one pass

1. `main.jsx` mounts `App` inside `ThemeProvider`.
2. `App.jsx` observes Firebase Auth, subscribes to `users/{uid}`, normalizes permissions, and selects buyer/seller/admin view.
3. `App.jsx` owns live listeners for `projects`, `leads`, `visits`, `cashbacks`, and `notifications`, scoped by role/view.
4. Feature components receive records and mutation callbacks through props; local UI state uses React hooks.
5. Direct client writes handle allowed ordinary records. Callable functions own property review/status/assignment, seller-request review, feed assets, and cashback lifecycle.
6. Firestore and Storage rules remain the final authorization boundary.

See [02_ARCHITECTURE.md](./02_ARCHITECTURE.md).

## Navigation in one pass

- Signed out → Login.
- Buyer → Home, Map, Cashback; project selection opens quick/detail experiences; profile menu can switch to permitted views.
- Seller → Dashboard/Projects, Create listing, Leads, Site visits, Cashback requests, Profile.
- Admin → Dashboard, Properties, Buyers, Sellers, Seller requests, Listings/moderation, Cashbacks, Feed, Profile, Settings; Admin may enter an approved seller workspace.

See [04_NAVIGATION.md](./04_NAVIGATION.md).

## Database in one pass

| Collection | Purpose |
|---|---|
| `users` | Profile and permissions |
| `sellerRequests` | Buyer-to-seller access requests |
| `projects` | Canonical property/listing records |
| `layouts` | Project polygon/phase layouts |
| `leads` | Buyer interest records |
| `visits` | Site-visit bookings |
| `cashbacks` | Cashback claims and lifecycle |
| `notifications` | Recipient-scoped workflow notices |
| `feed` | Admin-managed buyer-home banners |
| `propertyAuditLogs` | Server-written property lifecycle audit |
| `cashbackAuditLogs` | Server-written cashback lifecycle audit |

Never rename these collections. See [03_DATABASE.md](./03_DATABASE.md).

## Current implementation state

- Completed: authentication, role routing, active-project discovery, Google map/markers/layouts, search/filtering, project detail display, visit booking, seller listing workspace, seller applications/admin review, property moderation lifecycle, feed banners, notification display, cashback submission/review/payment recording, responsive role workspaces, theme support.
- Partial: favorites UI state is session-only; property schema contains legacy aliases; tests cover selected utilities only; some UI actions are visible but not backed by a persisted feature.
- Not implemented: persistent favorites/shortlists/comparison/export, payment gateway/booking payment, automated deployment pipeline, documented production monitoring/backup procedures.
- Removed/superseded: legacy status labels are normalized; Leaflet buyer map is not the active surface; old speculative roadmap/PRD claims are not project truth.
- Active phase: stabilization and documentation consolidation around the implemented Firebase workflows.

See [01_CURRENT_STATE.md](./01_CURRENT_STATE.md) and [08_CHANGELOG.md](./08_CHANGELOG.md).

## Non-negotiable coding rules

- Read the target files before editing.
- Do not invent product behavior, fields, metrics, or data.
- Do not rename collections or status values.
- Only `status === "active"` is buyer-visible.
- Do not bypass callable functions for protected lifecycle transitions.
- Do not modify permissions client-side.
- Do not introduce a dependency without explicit approval.
- Reuse existing components, utilities, tokens, and architecture.
- Do not refactor unrelated working code.
- Do not add placeholder implementations presented as complete.
- Preserve compatibility aliases until an approved migration removes them.
- Update the relevant docs and changelog with behavior/schema changes.

See [07_CODE_STANDARDS.md](./07_CODE_STANDARDS.md).

## UI and business constraints

- `src/styles/druvio-design-system-v1.css` loads after legacy CSS and is the final visual authority.
- Use `--ds-*` tokens and existing shared classes for new UI.
- Respect mobile layouts, 48 px control/touch containers, visible focus, and reduced motion.
- Keep UI behavior in [05_UI_RULES.md](./05_UI_RULES.md) and domain behavior in [06_BUSINESS_RULES.md](./06_BUSINESS_RULES.md).

## Read next

| If the task affects… | Read |
|---|---|
| Any implementation | `01_CURRENT_STATE.md`, `07_CODE_STANDARDS.md` |
| Components/data flow/backend | `02_ARCHITECTURE.md` |
| Firestore, Storage, fields, queries | `03_DATABASE.md`, rules, indexes |
| Screens/routes/view changes | `04_NAVIGATION.md` |
| Styling or components | `05_UI_RULES.md`, `DESIGN_SYSTEM.md`, active CSS |
| Permissions/status/cashback/search | `06_BUSINESS_RULES.md` |
| One feature | Matching file under `features/` |
| Planned work | `tasks/active.md`, `tasks/backlog.md` |
| Architectural rationale | Relevant ADR under `decisions/` |

## Required TODOs

- TODO: Confirm the intended production release/version label; repository package version is `1.0.0` but no release process is defined.
- TODO: Approve and execute a canonical-field migration before deleting any legacy project aliases.
- TODO: Define production observability, backup, recovery, accessibility test, and deployment ownership.
