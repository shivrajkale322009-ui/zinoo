# ADR-002: Permission-Based Role Views

- **Status:** Accepted
- **Date:** 2026-07-28
- **Decision:** Represent access with cumulative `buyer`, `seller`, and `admin` permissions, while reading legacy `role` values for compatibility.
- **Reason:** One account can access multiple workspaces; Admin managed-seller operation requires cumulative access.
- **Alternatives considered:** One exclusive role per account; separate account types.
- **Impact:** UI switches views in memory; server authorization reads user profiles; permission fields cannot be self-edited; legacy role migration remains TODO.
