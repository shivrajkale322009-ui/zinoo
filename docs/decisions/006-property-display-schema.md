# ADR-006: Versioned Property Display Compatibility Layer

- **Status:** Accepted
- **Date:** 2026-07-28
- **Decision:** Allow optional `projects.display` with integer `schemaVersion`, while generating/merging a display model from legacy top-level fields.
- **Reason:** Current records use several aliases and arrays; the UI needs a structured presentation contract without breaking existing data.
- **Alternatives considered:** Immediate destructive migration; rejected because the actual production field inventory and migration approval are missing.
- **Impact:** Readers must use display-model utilities; writers preserve compatibility fields; canonical migration is an active task.
