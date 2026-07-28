# Property Listings and Lifecycle

- **Purpose:** Create, edit, review, assign, and publish seller-owned projects.
- **User story:** Sellers maintain their inventory; Admin validates and controls buyer visibility.
- **UI:** Seller create/edit and portfolio; Admin properties/detail/editor/moderation; location/layout and media/document managers.
- **Business logic:** Ownership is mandatory; creation/change submission enters `pending`; approve and activate are separate; only active is public.
- **Database usage:** `projects`, `layouts`, `propertyAuditLogs`; project media/document Storage.
- **Backend logic:** `createProjectForSeller`, `submitProjectChanges`, `reviewProject`, `setProjectStatus`, `assignProjectSeller`.
- **Dependencies:** status, display-model, land/area/completeness/geometry/document utilities.
- **Edge cases:** invalid/deactivated seller, missing publishing fields, legacy statuses/aliases, concurrent review, orphan layout.
- **Future improvements:** TODO: canonical migration and delete/archive policy.
- **Definition of Done:** Owner is valid; status transition is allowed; buyer visibility matches status; audit is created; rules reject bypasses.
