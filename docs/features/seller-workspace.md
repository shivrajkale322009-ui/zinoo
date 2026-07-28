# Seller Workspace

- **Purpose:** Provide one workspace for seller inventory and related activity.
- **User story:** A Seller reviews portfolio metrics, manages listings, and sees leads, visits, and assigned cashback requests.
- **UI:** Dashboard/Projects, Create listing, Edit listing, Leads, Site visits, Cashback requests, Profile.
- **Business logic:** Queries scope by owner/project owner; Admin-managed seller mode binds creation to the selected approved seller.
- **Database usage:** `projects`, `leads`, `visits`, `cashbacks`, `notifications`, `users`.
- **Backend logic:** Property and cashback callables for protected transitions.
- **Dependencies:** `SellerDashboard`, property/media/display components, cashback workspace.
- **Edge cases:** no inventory/activity; Seller loses approval; Admin restores stale managed context; mobile destination parity.
- **Future improvements:** TODO: define pipeline/visit state machines and mobile nav parity.
- **Definition of Done:** Seller sees only assigned records; actions preserve ownership; empty/error states are usable; managed mode cannot create ownerless projects.
