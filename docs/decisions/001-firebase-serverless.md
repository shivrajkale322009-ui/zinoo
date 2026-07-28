# ADR-001: Firebase Serverless Backend

- **Status:** Accepted
- **Date:** 2026-07-28 (documented from existing implementation)
- **Decision:** Use Firebase Auth, Firestore `default`, Storage, callable Functions, Hosting, and client SDKs as the application backend.
- **Reason:** The implemented app depends on real-time listeners, Firebase identity, rules, trusted callable transactions, and static PWA hosting.
- **Alternatives considered:** Custom REST/backend and relational database; no evidence of an approved migration exists.
- **Impact:** Rules/functions are part of every data change; Firebase configuration consistency and emulator tests are critical; vendor-specific APIs are expected.
