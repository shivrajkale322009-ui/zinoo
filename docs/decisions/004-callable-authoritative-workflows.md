# ADR-004: Callable Functions Own Protected Workflows

- **Status:** Accepted
- **Date:** 2026-07-28
- **Decision:** Property lifecycle/assignment, seller review, feed assets, and cashback creation/transitions execute in authenticated callable functions.
- **Reason:** These operations require role validation, authoritative calculation, multi-document transactions, audit records, or restricted Storage access.
- **Alternatives considered:** Direct client writes guarded only by rules; rejected for workflows needing computation/auditing/atomic writes.
- **Impact:** Client code submits intent, not authoritative values; Firestore rules deny bypasses; functions and rules require paired tests.
