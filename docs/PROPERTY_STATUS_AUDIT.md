# Property status audit

Canonical property statuses are defined in `functions/propertyStatus.json`:

`draft`, `pending`, `approved`, `active`, `inactive`, `sold`, `rejected`.

Status fields belonging to seller requests, visits, leads, cashback claims,
documents, accounts, and validation errors are separate domains and are not
property status readers or writers.

| File | Accepted property values | Values written | Values read |
| --- | --- | --- | --- |
| `functions/propertyStatus.json` | All canonical values plus legacy migration aliases | None | Canonical enum and legacy mapping |
| `src/utils/projectVisibility.js` | All canonical values | None | `active` for buyer visibility |
| `src/App.jsx` | All canonical values received from Firestore | `pending` on seller create/edit | Buyer query reads only `active` |
| `src/components/SellerDashboard.jsx` | All canonical values for labels | Seller edits write `pending`; admin actions request `approved`, `rejected`, `active`, `inactive`, or `sold` | Reads status for counts, badges, and action availability |
| `src/components/AdminPanel.jsx` | All canonical values | Requests `approved`, `rejected`, `active`, `inactive`, or `sold` through Cloud Functions | Reads all values for filters, badges, metrics, and actions |
| `src/components/BuyerApp.jsx` | All canonical values for the read-only admin display | Does not directly change property status | Receives only active buyer projects |
| `src/components/BuyerMap.jsx` | `active` through the shared helper | None | Uses shared buyer-visibility helper |
| `src/maps/MapScreen.jsx` | `active` through the shared helper | None | Uses shared buyer-visibility helper |
| `src/maps/projectMapService.js` | All canonical values in project payloads | Defaults missing form status to `draft`; otherwise preserves current status | Bounds query reads only `active` |
| `src/utils/adminPropertyUtils.js` | All canonical values | None | Rejects values outside the canonical enum |
| `functions/index.js` | All canonical property values | `pending`, `approved`, `rejected`, `active`, `inactive`, `sold` | Validates transition source states |
| `firestore.rules` | All canonical values | Allows seller create/edit only as `pending`; Admin client edits must preserve status | Buyer reads only `active`; owner/Admin reads remain available |
| `functions/migrate-property-statuses.js` | Canonical and mapped legacy values | Writes normalized lowercase status | Reads every project status in dry-run/apply mode |

## Firestore queries

- `src/App.jsx`: buyer subscription uses `where("status", "==", "active")`.
- `src/maps/projectMapService.js`: map bounds loader uses
  `where("status", "==", "active")`.

No property query accepts `approved`, `published`, or capitalized `Active`.

## Cloud Function transitions

- `createProjectForSeller`: creates `pending`.
- `submitProjectChanges`: saves seller changes and sets `pending`.
- `reviewProject`: changes `pending` to `approved` or `rejected`.
- `setProjectStatus`: changes:
  - `approved` to `active`, `inactive`, or `sold`;
  - `active` to `inactive` or `sold`;
  - `inactive` to `active` or `sold`.

`reviewSellerRequest` also writes a `status`, but it belongs to the
`sellerRequests` collection and is intentionally unchanged.

## Validation fixes

The previous implementation rejected lowercase `active` in:

- `src/utils/adminPropertyUtils.js`;
- `src/utils/projectVisibility.js`;
- `firestore.rules`.

All three now accept the canonical lowercase enum.

## Legacy migration

The migration is dry-run by default and applies these relevant mappings:

| Legacy value | Canonical value |
| --- | --- |
| `Active` | `active` |
| `approved` | `approved` |
| `pending_review` | `pending` |
| `Published` / `published` | `pending` |
| `Sold Out` | `sold` |
| `unpublished` | `inactive` |
| `changes_pending_review` | `pending` |

Unknown values are reported and left unchanged for manual review.
