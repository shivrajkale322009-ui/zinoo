# Admin Operations

- **Purpose:** Govern users, sellers, listings, feed content, and financial workflow records.
- **User story:** An Admin reviews pending work and performs authorized lifecycle decisions.
- **UI:** Dashboard, Properties, Buyers, Sellers, Seller requests, Listings, Cashbacks, Feed, Profile, Settings.
- **Business logic:** Admin privilege comes from profile; seller/property/cashback decisions follow exact callable preconditions.
- **Database usage:** Global reads of application collections (root shared listeners limit most to 500); audit collections under rules.
- **Backend logic:** All privileged callable functions.
- **Dependencies:** `AdminPanel`, detail/editor, feed manager, cashback workspace.
- **Edge cases:** invalid seller association; stale selected record; query limit; legacy user role; duplicate workflow action.
- **Future improvements:** TODO: pagination, audit-log UI, explicit global notification fan-out.
- **Definition of Done:** Unauthorized users cannot enter or invoke operations; decisions are transactional/audited; actionable errors identify failed preconditions.
