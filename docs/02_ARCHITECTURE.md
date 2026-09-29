# System Architecture

## System boundary

```text
Browser/PWA
  React views and local state
  Firebase client SDK
        |
        +--> Firebase Auth
        +--> Firestore `default` (listeners and permitted writes)
        +--> Firebase Storage (per-path uploads)
        +--> Callable Functions `us-central1` (protected workflows)
        +--> Google Maps JavaScript API

Firebase Hosting serves `dist/` and rewrites all routes to `index.html`.
```

## Frontend

- Entry: `src/main.jsx`.
- Root coordinator: `src/App.jsx`.
- Render model: one authenticated React tree; no URL router.
- View selection: in-memory `currentView` (`buyer`, `seller`, `admin`) constrained by normalized permissions.
- Feature navigation: component-local state (`activeScreen` or `activeTab`).
- State management:
  - React context: theme only.
  - Root hooks: auth, profile, permissions, shared Firestore records.
  - Feature hooks: screen, modal, filter, form, and derived state.
  - Firestore `onSnapshot`: live server state.
- Dependency injection: `App` passes data and mutation callbacks into role workspaces.
- Error containment: `BuyerErrorBoundary` wraps buyer UI.

## Backend

`functions/index.js` exports callable functions in `us-central1`:

| Function | Responsibility |
|---|---|
| `manageFeedBannerAsset` | Admin-only banner Storage upload/delete |
| `createProjectForSeller` | Admin creates a seller-owned pending project |
| `submitProjectChanges` | Owner submits changes and returns project to pending |
| `reviewProject` | Admin approves or rejects pending project |
| `setProjectStatus` | Admin changes allowed post-review status |
| `assignProjectSeller` | Admin reassigns a project to a valid seller |
| `reviewSellerRequest` | Admin approves/rejects seller access request |
| `submitCashbackRequest` | Validates buyer/project/purchase and creates claim |
| `manageCashbackRequest` | Seller/admin cashback transitions, audit, notifications |

Callable CORS origins are `https://flinok.in`, `https://druvio.web.app`, `http://localhost:3000`, and `http://localhost:5173`.

## Firebase services

- Auth: Google popup and phone OTP/reCAPTCHA.
- Firestore: named database `default`.
- Storage: claim evidence, project media/documents, feed banners.
- Functions: Node.js 20, Firebase Functions v2 callable HTTPS.
- Analytics: initialized by the client; no documented event taxonomy.
- Hosting: static Vite build with SPA rewrite and cache headers.
- PWA: manifest and custom service worker registration.

## Authentication and authorization

1. Auth state resolves.
2. Client subscribes to `users/{uid}`.
3. `normalizePermissions` accepts current permission maps and legacy `role`.
4. Default view is Admin, then Seller, then Buyer.
5. UI visibility is convenience only; Firestore/Storage rules and functions enforce authority.
6. Missing/slow profile falls back to buyer UI with an error, but server rules still determine actual access.

## Firestore access pattern

- Buyer: active projects; own leads/visits/cashbacks; own notifications.
- Seller: owned projects; records whose `projectOwnerId` is the seller; own notifications.
- Admin view: up to 500 records per shared collection plus admin-specific listeners.
- Admin managed-seller view: seller-scoped projects/leads/visits; other collections are currently unfiltered.
- Writes:
  - Direct: allowed profile updates, seller requests, leads, visits, ordinary project drafts/edits, feed documents, notification read state.
  - Callable: protected property lifecycle, seller approval, feed Storage assets, all cashback creation/transitions.

## Maps

- Active surface: `src/maps/MapScreen.jsx`, Google Maps JavaScript API.
- Capabilities: hybrid basemap, Advanced Markers, clustering, viewport tracking, layer visibility, selected-project overlay, polygon drawing/editing, layout persistence.
- `projectMapService.js` owns `layouts` reads/writes.
- Google API key comes from `VITE_GOOGLE_MAPS_API_KEY` or `VITE_GOOGLE_MAPS_KEY`.
- `src/components/BuyerMap.jsx` is a legacy Leaflet implementation and is not mounted by `BuyerApp`.

## Storage

| Path | Writer | Types | Maximum |
|---|---|---|---|
| `cashback-claims/{uid}/{file}` | matching user | JPEG, PNG, PDF | 10 MB |
| `project-media/{uid}/...` | matching user | JPEG, PNG, WebP | 10 MB |
| `project-documents/{uid}/...` | matching user | PDF, JPEG, PNG | 50 MB |
| `feed-banners/{uuid}.{ext}` | callable function only | JPEG, PNG, WebP | 10 MB |

## Folder ownership

| Location | Responsibility |
|---|---|
| `src/components` | Role workspaces and reusable feature UI |
| `src/maps` | Active map and layout domain |
| `src/utils` | Pure/mostly pure normalization and calculations |
| `src/styles` | Final design-system tokens and shared components |
| `functions` | Trusted domain transitions |
| root Firebase files | Deployment, rules, indexes |
| `docs` | Product/engineering source of truth |

## Dependencies

- Runtime: React, React DOM, Firebase, Google marker clusterer, Lucide, Leaflet/react-leaflet.
- Development: Vite and React plugin/types.
- Functions: Firebase Admin and Firebase Functions.
- No external state library, router, CSS framework, form library, or payment SDK.

## Major decisions

- Firebase serverless architecture: [ADR-001](./decisions/001-firebase-serverless.md)
- Permission-based role views: [ADR-002](./decisions/002-permission-based-role-views.md)
- Active-only buyer visibility: [ADR-003](./decisions/003-active-only-property-visibility.md)
- Callable protected workflows: [ADR-004](./decisions/004-callable-authoritative-workflows.md)
- Google Maps and separate layouts: [ADR-005](./decisions/005-google-maps-and-layouts.md)
- Display schema compatibility: [ADR-006](./decisions/006-property-display-schema.md)

## Architecture TODOs

- TODO: Decide whether to remove Leaflet/`BuyerMap.jsx`.
- TODO: Define canonical project schema and migration versioning.
- TODO: Define emulator/testing strategy for rules and callables.
- TODO: Confirm whether `getAnalytics` must be guarded for unsupported environments.
