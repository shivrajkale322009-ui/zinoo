# Active Tasks

Only work currently required to stabilize the implemented system belongs here.

## A-001 Verify Firebase deployment parity

- **Objective:** Confirm deployed project `druvio` matches checked-in functions, Firestore rules/indexes, Storage rules, and hosting configuration.
- **Files involved:** `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`, `storage.rules`, `functions/`.
- **Dependencies:** Firebase project access and deployment history.
- **Acceptance criteria:** Differences are listed without destructive deployment; database ID/region/bucket are verified.
- **Definition of Done:** A dated verification result is recorded and mismatches become scoped tasks.

## A-002 Resolve cashback client-update ambiguity

- **Objective:** Determine whether `App.jsx` `updateCashbackStatus` is reachable and align active UI with callable-only rules.
- **Files involved:** `src/App.jsx`, `CashbackWorkspace.jsx`, `functions/index.js`, `firestore.rules`.
- **Dependencies:** Cashback workflow tests.
- **Acceptance criteria:** No active path attempts forbidden direct cashback updates; callable workflow remains authoritative.
- **Definition of Done:** Tests cover Buyer/Seller/Admin transitions and documentation reflects the result.

## A-003 Canonical project schema inventory

- **Objective:** Enumerate actual project fields/aliases before proposing migration.
- **Files involved:** project components/utilities/functions/rules and `03_DATABASE.md`.
- **Dependencies:** Read-only sample/export of real data, with sensitive values excluded.
- **Acceptance criteria:** Each alias has canonical target, type, nullability, reader, writer, and migration risk.
- **Definition of Done:** Migration proposal exists; no fields are removed yet.

## A-004 Establish Firebase test harness

- **Objective:** Add automated authorization and callable workflow coverage.
- **Files involved:** rules, functions, package scripts, tests.
- **Dependencies:** Firebase Emulator Suite.
- **Acceptance criteria:** Tests cover privilege escalation, active visibility, ownership, property transitions, cashback transitions, feed validation.
- **Definition of Done:** Deterministic local command passes and is documented.
