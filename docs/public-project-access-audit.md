# Public Project Access Audit

## Firestore

- Public project routes query `publicProjects` by `slug`, `publicVisibility == true`, and `status == active`.
- `publicProjects` is a sanitized projection created by backend code; it does not expose the source `projects` collection, seller profiles, or internal review data.
- Anonymous reads are limited to projections that are both publicly visible and active. Client writes remain denied.

## Storage

- Public project images and videos are stored at `project-media/{uploaderId}/{projectId}/...`.
- Anonymous reads are allowed only when `publicProjects/{projectId}` exists and is both publicly visible and active.
- `project-media/{uploaderId}/drafts/...`, `project-documents/...`, and every write/delete operation remain protected by the existing authenticated rules.

## Validation focus

- An anonymous query without the required public visibility and active-status constraints must be denied.
- An anonymous request for inactive/private project media must be denied.
- Seller and admin write flows continue to use their existing authenticated paths.
