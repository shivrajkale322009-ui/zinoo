# Cashback

- **Purpose:** Accept purchase evidence and track seller/admin verification through payment recording.
- **User story:** A Buyer submits and tracks a claim; assigned Seller and Admin perform sequential review.
- **UI:** Buyer New request/History; role-aware `CashbackWorkspace` for Buyer, Seller, Admin.
- **Business logic:** Backend computes area × project rate; status transitions and required rejection/payment details follow `06_BUSINESS_RULES.md`.
- **Database usage:** `cashbacks`, `cashbackAuditLogs`, `notifications`, `projects`; `cashback-claims/{uid}` Storage.
- **Backend logic:** `submitCashbackRequest`, `manageCashbackRequest` transactions.
- **Dependencies:** purchase-value/plot-area formatting, Firebase Functions/Storage.
- **Edge cases:** missing rate/project/seller/proof, invalid area, repeated action, rejected claim, failed upload after/before submit.
- **Future improvements:** Payment gateway is not implemented; TODO: define retry/orphan-proof cleanup.
- **Definition of Done:** Amount is server-derived; authorized role/status controls action; audit and notification are written atomically; buyer sees status.
