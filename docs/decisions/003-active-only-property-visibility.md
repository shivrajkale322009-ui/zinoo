# ADR-003: Active-Only Buyer Property Visibility

- **Status:** Accepted
- **Date:** 2026-07-28
- **Decision:** A buyer-facing property must have exact canonical status `active`.
- **Reason:** Approval and publication are distinct governance actions; one predicate prevents inconsistent exposure.
- **Alternatives considered:** Treat `approved`/`published`/booleans as visible; rejected because legacy aliases caused ambiguity.
- **Impact:** Queries, rules, cards, maps, search, and details must use the same predicate; migrations normalize old status spellings without publishing them.
