# Backlog

Backlog items are not implemented and must not be described as current behavior.

## B-001 Persist favorites and shortlist

- **Objective:** Replace session-only saved IDs with an approved cross-device model.
- **Files involved:** Buyer UI, Firestore rules/indexes, new or approved existing schema, feature docs.
- **Dependencies:** Product decision on per-user structure and privacy.
- **Acceptance criteria:** Save/remove/list syncs across sessions and respects security rules.
- **Definition of Done:** Data model, rules, UI states, migration, and tests are complete.

## B-002 Comparison and shortlist export

- **Objective:** Compare selected projects and export factual fields.
- **Files involved:** Buyer UI and project display/schema utilities.
- **Dependencies:** B-001 and approved comparison fields/export format.
- **Acceptance criteria:** Missing values remain missing; no inferred ranking.
- **Definition of Done:** Responsive comparison/export tests pass.

## B-003 Production operations

- **Objective:** Define CI/CD, observability, backups, recovery, and ownership.
- **Files involved:** workflow/config/runbook documents.
- **Dependencies:** Hosting/monitoring/tool choices and access.
- **Acceptance criteria:** Staging/production gates, rollback, alerts, backup/restore drill are defined.
- **Definition of Done:** A tested runbook and accountable owners exist.

## B-004 Remove legacy Leaflet path

- **Objective:** Remove dead Leaflet component/dependencies if confirmed unused.
- **Files involved:** `BuyerMap.jsx`, `package.json`, lockfile, docs.
- **Dependencies:** Repository-wide and deployed-bundle verification.
- **Acceptance criteria:** Active Google map behavior/build are unchanged.
- **Definition of Done:** Dependency removal passes tests/build and no import remains.

## B-005 Payment integration

- **Objective:** Implement an approved payment/transfer provider.
- **Files involved:** Unknown until provider and scope are selected.
- **Dependencies:** Legal, accounting, security, provider, refund, webhook, and reconciliation requirements.
- **Acceptance criteria:** TODO after requirements; current payment recording must not be mistaken for gateway processing.
- **Definition of Done:** Approved end-to-end specification, secure implementation, reconciliation, and failure tests.
