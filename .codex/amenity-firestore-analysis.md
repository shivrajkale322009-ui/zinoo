# Amenity Firestore analysis

- Target database: `projects/druvio/databases/default` (Enterprise, Native mode).
- Existing buyer query: authenticated buyers read active `projects`; public visitors read `publicProjects` projections.
- Existing seller writes: sellers update their owned `projects` document through the existing pending-review workflow.
- Existing bug: `display.amenities.items` could override root `project.amenities`, and the public projection fell back to it.
- Canonical project fields: `amenityIds` (stable catalog references) and `amenities` (seller-selected display-name snapshots).
- Master collection: `amenityCatalog/{amenityId}` with `name`, `isActive`, `createdAt`, `updatedAt`.
- Access: admin CRUD; admin/seller read; buyer/public no catalog access. Buyers receive only selected names embedded in the project or public projection.
- Real-time standard listeners are retained because seller/admin catalog changes and project publication are expected to update live.

## Security attack review

- Public catalog list: denied because catalog reads require seller/admin.
- Buyer cross-project amenities: each list is embedded only in its own project/projection.
- Seller catalog modification: denied; catalog writes require admin.
- Seller ownership hijack: existing project ownership/status checks remain required.
- Oversized amenity arrays: project validator limits both lists to 100 entries; catalog names are limited to 80 characters.
- Catalog schema pollution: catalog validator allows only the five documented fields.
- Catalog ID/name mutation: document ID and `createdAt` remain immutable; renames retain the stable reference ID.
