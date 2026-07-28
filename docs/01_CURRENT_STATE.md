# Current State

**Evidence date:** 2026-07-28  
**Authority:** checked-in client, functions, Firebase rules/indexes/configuration, and tests.

## Status definitions

| Status | Meaning |
|---|---|
| Completed | Implemented in the current repository |
| In Progress | Partially implemented or incomplete across layers |
| Planned | Documented need; no complete implementation |
| Removed | Superseded, legacy, or intentionally not part of the active flow |

## Feature inventory

| Feature | Status | Current evidence |
|---|---|---|
| Google and phone authentication | Completed | `LoginScreen.jsx`, Firebase Auth |
| Profile and permission routing | Completed | `App.jsx`, `permissions.js`, `users` rules |
| Buyer Home/Map/Cashback navigation | Completed | `BuyerApp.jsx` |
| Active-property discovery | Completed | `status == active` listener and visibility utility |
| Project search and filters | Completed | name/location/developer search; budget, land zone, NA status, bank-loan filters |
| Google Maps project map | Completed | advanced markers, clustering, selection, layers, layout display |
| Project details/media/verified documents | Completed | display model, gallery, in-app document viewer |
| Site visit booking | Completed | creates visit and a lead when needed |
| Seller project workspace | Completed | dashboard, create/edit, media/documents, leads, visits |
| Project approval/lifecycle | Completed | callable functions, audit logs, admin UI |
| Admin-managed seller workspace | Completed | session-restored seller context |
| Seller access request/review | Completed | `sellerRequests`, modal, admin callable |
| Feed banners | Completed | admin CRUD, callable Storage upload/delete, buyer carousel |
| Notifications | Completed | recipient query and read-state update |
| Cashback workflow | Completed | buyer submission, seller/admin review, payment record, audit/notification creation |
| Responsive role-specific layouts | Completed | desktop sidebars and mobile navigation/drawers |
| Dark theme | Completed | theme provider and current CSS variables |
| Persistent favorites | In Progress | local `Set` state only; no Firestore persistence |
| Automated tests | In Progress | utility tests exist; UI, functions, and rules lack comprehensive coverage |
| Canonical project schema migration | In Progress | normalization utilities support multiple legacy aliases |
| Favorites list/comparison/export | Planned | no backed screen or data model |
| Payment gateway and plot booking payment | Planned | cashback records payment metadata only; no gateway dependency |
| Production CI/CD, monitoring, backup runbooks | Planned | Firebase deploy scripts exist; no verified pipeline/runbooks |
| Leaflet buyer map | Removed | component/dependency remain, but active buyer flow uses `maps/MapScreen.jsx` |
| Legacy property status spellings | Removed | retained only in `propertyStatus.json` migration map |
| Speculative PRD/roadmap features | Removed | replaced by verified current-state and backlog documents |

## Active development phase

- Stabilize current role, property, media, feed, notification, and cashback workflows.
- Consolidate documentation as the source of truth.
- Resolve schema aliases and missing test/operations coverage before expansion.

## Known gaps and risks

- `App.jsx` direct `updateCashbackStatus` logic is inconsistent with rules that deny cashback client updates; active workflow should use `manageCashbackRequest`. Confirm whether the callback is still reachable before removing it.
- Feed admin notification uses recipient ID `admins`, while normal admin UI queries by a concrete user UID. Confirm intended admin-notification fan-out.
- `users` supports legacy `role` and current `permissions`; migration ownership is undefined.
- `projects` supports legacy fields and nested `display`; required canonical fields beyond rule validation are not fully enforced.
- `BuyerMap.jsx` and Leaflet dependencies create dead-code ambiguity.
- TODO: Verify deployed Firebase configuration matches the checked-in rules, functions, indexes, and Storage rules.
- TODO: Define accessibility, browser, and device acceptance matrices.
