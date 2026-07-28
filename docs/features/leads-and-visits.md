# Leads and Site Visits

- **Purpose:** Connect buyer interest and bookings to projects and sellers.
- **User story:** A Buyer books a visit; the Seller/Admin can see the associated activity.
- **UI:** Buyer booking modal; Seller Leads and Site Visits tables; Admin activity oversight through loaded records.
- **Business logic:** Submission requires name, phone, date; booking creates a visit and conditionally creates a lead when no loaded phone match exists.
- **Database usage:** `leads`, `visits`, relationships to `projects` and `users`.
- **Backend logic:** Direct rule-authorized client writes; no callable.
- **Dependencies:** Root mutation callbacks and buyer/seller components.
- **Edge cases:** duplicate phone across users/projects, stale loaded lead set, invalid date/phone, project owner changes.
- **Future improvements:** TODO: server-side deduplication and canonical statuses.
- **Definition of Done:** Buyer/owner/Admin access is correct; records carry creator/project/owner IDs; failures are surfaced; no fabricated lead data.
