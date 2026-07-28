# Authentication and Roles

- **Purpose:** Establish identity and select authorized workspaces.
- **User story:** A user signs in and reaches Buyer, Seller, or Admin capabilities granted by their profile.
- **UI:** `LoginScreen`, profile dropdown, edit profile, become-seller modal, role switches.
- **Business logic:** Buyer is baseline; Seller includes Buyer; Admin includes all; profile permissions cannot be self-modified.
- **Database usage:** `users/{uid}`, `sellerRequests/{uid}`.
- **Backend logic:** Firebase Auth; `reviewSellerRequest` performs Admin approval/rejection.
- **Dependencies:** Firebase Auth/Firestore, permissions utilities.
- **Edge cases:** missing/slow profile buyer fallback; legacy `role`; blocked seller statuses; Admin seller view requires selected valid seller.
- **Future improvements:** TODO: formal account recovery, role migration, emulator coverage.
- **Definition of Done:** Auth providers work; profile exists; permitted default view is selected; rules prevent privilege escalation; failures are visible.
