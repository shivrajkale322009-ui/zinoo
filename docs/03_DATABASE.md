# Database and Storage Contract

**Firestore database ID:** `default`  
**Schema model:** schemaless documents with rule-enforced invariants and compatibility aliases. Fields marked required below are required by rules/functions, not necessarily by every legacy record.

## `users/{uid}`

| Aspect | Contract |
|---|---|
| Purpose | Authenticated profile and authorization source |
| Key fields | `permissions: {buyer, seller, admin}`; legacy `role`; profile fields such as `displayName`, `email`, `phoneNumber`, `businessName`; seller status aliases |
| Relationships | UID equals Firebase Auth UID; referenced by project ownership/review/audit fields |
| Writes | User creates own buyer-only profile; self/admin may update without changing permissions |
| Security | Self or Admin reads; no delete |

TODO: Define the canonical optional profile field list and migrate legacy `role`.

## `sellerRequests/{uid}`

| Aspect | Contract |
|---|---|
| Purpose | Request seller permission |
| Required creation fields | `userId == auth.uid`, `status == "pending"` |
| Common fields | Applicant/business/contact data, `createdAt`, review fields |
| Relationships | Document ID and `userId` identify the applicant |
| Writes | Applicant creates/edits own pending request without changing identity/creation time; callable performs review |
| Security | Applicant or Admin reads; no delete |

## `projects/{projectId}`

| Aspect | Contract |
|---|---|
| Purpose | Canonical property/listing and buyer display source |
| Rule-required fields | `ownerId` non-empty string; `sellerUid == ownerId`; `name` length ≥ 2; valid `status` |
| Status | `draft`, `pending`, `approved`, `active`, `inactive`, `sold`, `rejected` |
| Ownership/provenance | `ownerId`, `sellerUid`; legacy/compatibility `sellerId`; `createdBy`, `createdByRole`, `createdByAdmin`, timestamps |
| Core property fields in use | `name`, descriptions, village/taluka/district/area, coordinates/location, prices, plot-area fields, land/NA fields, loan/verification fields, contact/developer fields |
| Media/documents | hero aliases, image/gallery aliases, `documents[]`, Storage metadata |
| Display | optional `display` map with integer `schemaVersion` and nested basic/pricing/media/verified/cashback/rating/features/stats/overview/amenities/documents/map/trust/actions/visibility sections |
| Relationships | Owner → `users`; layouts/leads/visits/cashbacks/audits refer to project |
| Security | Signed-in users read active; Admin reads all; owner reads own. Seller creates own pending project. Admin lifecycle changes use callables |

Publishing preconditions in functions: valid seller, valid name, cover/hero image, valid non-zero coordinates, positive starting price.  
TODO: Approve a canonical field dictionary; current utilities intentionally read several legacy aliases.

## `layouts/{layoutId}`

| Aspect | Contract |
|---|---|
| Purpose | Project phase/plot polygon stored separately from project |
| Fields in use | `projectId`, `name`, `polygonCoordinates[]`, `color`, `visible`, `createdAt`, `updatedAt` |
| Relationships | `projectId` → `projects/{projectId}` |
| Security | Admin, owner, or users who can see the active parent project may read; Admin/owner may write |
| Indexes | No composite index checked in |

## `leads/{leadId}`

| Aspect | Contract |
|---|---|
| Purpose | Buyer interest and seller pipeline |
| Fields in use | `createdBy`, `projectId`, `projectOwnerId`, `project`, `name`, `phone`, `budget`, `stage`, timestamps |
| Relationships | Buyer → `users`; project/owner → `projects`/`users` |
| Security | Creator, assigned owner, or Admin reads; creator/Admin updates; Admin deletes |
| Query indexes | None checked in; current single-field filters use automatic indexes |

TODO: Define canonical stages; current code uses values including `New`, `Visit Scheduled`, and `Purchased`.

## `visits/{visitId}`

| Aspect | Contract |
|---|---|
| Purpose | Site-visit booking |
| Fields in use | `createdBy`, `projectId`, `projectOwnerId`, `project`, buyer name/phone, `date`, `status`, timestamps |
| Relationships | Buyer, project, owner |
| Security | Same ownership/read/update model as leads |
| Indexes | None composite |

TODO: Define canonical visit status transitions and date storage type; current creation uses a date form value.

## `cashbacks/{cashbackId}`

| Aspect | Contract |
|---|---|
| Purpose | Cashback request, review, and payment record |
| Submission fields | `createdBy`, buyer identity, `projectId`, `projectOwnerId`, project label, purchased area, proof URL/path, computed rate/amount |
| Workflow fields | `status`, seller/admin review fields and reasons, payment method/date/reference, timestamps |
| Statuses | `Pending Seller Approval`, `Pending Admin Approval`, `Approved`, `Payment Pending`, `Paid`, `Rejected` |
| Relationships | Buyer, project, seller; audit/notifications reference cashback ID |
| Security | Client create/update/delete denied; callable transactions only. Buyer, assigned owner, Admin read |
| Composite indexes | `createdBy + createdAt desc`; `projectOwnerId + createdAt desc`; `status + createdAt desc` |

The function computes `cashbackAmount = purchasedAreaSqFt * project cashback rate`; clients cannot supply the authoritative amount.

## `notifications/{notificationId}`

| Aspect | Contract |
|---|---|
| Purpose | Workflow notices |
| Fields in use | `recipientId`, `title`, `message`, reference/type fields, `read`, `createdAt`; `readAt` on update |
| Security | Recipient or Admin reads; recipient may update only `read`/`readAt`; clients cannot create/delete |
| Composite index | `recipientId + createdAt desc` |

TODO: Resolve special `recipientId: "admins"` delivery semantics.

## `feed/{bannerId}`

| Aspect | Contract |
|---|---|
| Purpose | Buyer-home banner carousel |
| Exact fields | `imageUrl`, `displayOrder` (integer 1–5), `isActive`, `storagePath`, `createdAt`, `updatedAt` |
| Validation | Firebase Storage download URL; path `feed-banners/{uuid}.{jpg|png|webp}` |
| Security | Signed-in users read active; Admin reads/writes; document contains no extra keys |
| Composite index | `isActive + displayOrder asc` |

## Audit collections

| Collection | Purpose | Writers | Readers |
|---|---|---|---|
| `propertyAuditLogs` | Property create/review/status/assignment history | Callable functions only | Admin |
| `cashbackAuditLogs` | Cashback transition history | Callable functions only | Admin |

Common audit fields include subject ID, action, actor/role, previous/new status, server timestamp, and optional metadata.

## Relationships

```text
users/{buyer}  -> leads, visits, cashbacks, notifications
users/{seller} -> projects.ownerId -> layouts, leads, visits, cashbacks
users/{admin}  -> review/status/audit actor fields
projects/{id}  -> layouts.projectId and activity projectId
cashbacks/{id} -> cashbackAuditLogs and notifications reference
```

References are string IDs, not Firestore `DocumentReference` values. Cascading delete behavior is not implemented.

## Query/index contract

Checked-in composite indexes:

- `cashbacks(createdBy ASC, createdAt DESC)`
- `cashbacks(projectOwnerId ASC, createdAt DESC)`
- `cashbacks(status ASC, createdAt DESC)`
- `notifications(recipientId ASC, createdAt DESC)`
- `feed(isActive ASC, displayOrder ASC)`

Any new compound query must ship with its index.

## Storage metadata in project documents

Active utilities use fields such as `id`, `type`, `fileName`, `displayName/title`, `storagePath`, `downloadURL/url`, `contentType`, `size`, `status`, `verified`, `uploadedBy`, `uploadedAt`, `showOnDetails`, `enabled`, `order`.

Security rules allow fewer document file types than the UI extension list. Server rules are authoritative.

## Database invariants

- IDs and owner fields are never silently reassigned.
- Server timestamps are used for trusted lifecycle events.
- Buyer discovery reads only exact active status.
- Admin approval and activation are separate transitions.
- Audit collections are append-only from trusted functions.
- Unknown/legacy fields must not be removed until migration is approved and verified.
