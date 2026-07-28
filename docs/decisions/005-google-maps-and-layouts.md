# ADR-005: Google Maps with Separate Layout Records

- **Status:** Accepted
- **Date:** 2026-07-28
- **Decision:** Use Google Maps JavaScript API for the active map and store editable project polygons in `layouts`.
- **Reason:** Current implementation uses Advanced Markers, Places, clustering, geometry, drawing/editing, and multiple layouts per project.
- **Alternatives considered:** Leaflet implementation remains in the repository but is not mounted; embedded/static maps lack editing capability.
- **Impact:** Google key/configuration is required for full map behavior; layout authorization follows parent project ownership/visibility; Leaflet cleanup is backlog.
