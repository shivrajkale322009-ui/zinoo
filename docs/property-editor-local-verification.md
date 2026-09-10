# Local Property Editor Verification

This workflow uses only Firebase emulators. It never connects to production when `VITE_USE_FIREBASE_EMULATORS=true`.

## Prerequisites

- Node.js 20+
- Java on `PATH` (required by the Firestore emulator)

## Start the isolated environment

In one terminal:

```powershell
npm run emulators -- --project druvio
```

In a second terminal:

```powershell
npm run seed:property-editor
```

Create a local `.env.local` file containing:

```text
VITE_USE_FIREBASE_EMULATORS=true
VITE_FIREBASE_EMULATOR_HOST=127.0.0.1
```

Then run `npm run dev` and sign in with one of these emulator-only identities:

| Role | Email | Password |
|---|---|---|
| Seller | `seller@example.test` | `PropertyEditor123!` |
| Admin | `admin@example.test` | `PropertyEditor123!` |
| Buyer | `buyer@example.test` | `PropertyEditor123!` |

The seeded project ID is `property-editor-e2e`. It deliberately has a stale `display.documents.items` entry to exercise the document-preservation regression.

## Required checks

1. Seller: open the seeded project, change one safe field, save, and reopen it.
2. Seller: change the name, price, cashback, description, and location; save and reopen it.
3. Verify documents, gallery metadata, amenities, legal fields, ownership, and `layoutPolygon` remain intact.
4. Admin: edit an active test copy if buyer visibility needs verification; seller pending records are intentionally not buyer-visible.
5. Create a project, then reopen it. Buyer visibility requires the existing approval/activation lifecycle.

Do not use the emulator test project or credentials outside local emulator endpoints.
