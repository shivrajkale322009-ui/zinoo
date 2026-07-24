# Firestore property status analysis

Collections involved: `projects`, `users`, `propertyAuditLogs`, `sellerRequests`, `leads`, `visits`, and `cashbacks`.

Property documents use one lowercase `status` field with these values: `draft`, `pending`, `approved`, `active`, `inactive`, `sold`, and `rejected`. Seller edits move a property to `pending`. Admin review moves it to `approved` or `rejected`. Admin activation moves an approved property to `active`. Buyer property reads use `projects where status == active`; no other property status is buyer-visible. Seller reads are scoped by `ownerId`, and Admin reads are capped at 500.

`functions/propertyStatus.json` is the canonical enum and legacy mapping used by both the frontend and Cloud Functions. `functions/migrate-property-statuses.js` is dry-run by default and normalizes legacy values before the new query and rules are deployed.

The configured project is `druvio` and database ID is `default`. The local Firebase CLI edition query could not run because its npm cache lacks the `async` package, so the rules use standard/native Firestore syntax already present in the repository.
