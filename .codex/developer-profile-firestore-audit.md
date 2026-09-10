# Developer profile Firestore audit

- Database: named `default`, Enterprise / Firestore Native.
- Private source: `users/{uid}` remains owner/admin readable only.
- Public read: authenticated callable `getDeveloperProfile`; it projects allowlisted public fields and uses `projects.ownerId` with active/sold status count queries.
- Seller write: authenticated callable `updateDeveloperProfile`; approved-seller check plus a strict payload allowlist and type/length/range validation.
- Account write: direct owner updates are limited to displayName, firstName, lastName, phoneNumber, and updatedAt. Admin writes retain existing authority.
- Logo path: `developer-profile-logos/{uid}/{timestamp}.{jpg|png|webp}`, owner-only write/delete, authenticated read, 5 MB and MIME validation.
- Admin curation: `featuredDevelopers` remains admin-write-only, including delete.

## Devil's advocate results

- Cross-user developer update: blocked because the callable always writes `request.auth.uid`.
- Role/permissions/verification/owner injection: rejected by callable allowlist; unit-tested.
- Oversized strings, invalid URL schemes, invalid years, and type juggling: rejected by server validation.
- Direct role escalation on own user document: blocked by Firestore affected-field allowlist.
- Featured metadata removal by seller: blocked; delete is admin-only.
- Logo path traversal/cross-user upload: blocked by Storage path ownership and filename constraints.
- Hidden profile read: non-owner/non-admin receives not-found from callable.
- Mixed-content leak: user documents are not made buyer-readable; callable returns a public projection only.
- Project ownership: profile and map filtering use `ownerId`; seller profile writes cannot touch projects.
- Rule syntax: Firestore and Storage rules compiled successfully with Firebase CLI dry-run on 2026-08-09.
