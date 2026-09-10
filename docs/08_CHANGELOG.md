# Changelog

Repository-observed changes only. Newest first.

## 2026-07-28

### Documentation

- Replaced legacy PRD/roadmap/architecture documents with an AI-first source-of-truth structure.
- Separated current state, architecture, database, navigation, UI rules, business rules, code standards, features, tasks, and ADRs.
- Marked unknown operational and migration details as TODOs.
- Removed contradictory claims about unimplemented CI/CD, monitoring, public browsing, Leaflet as the active map, and planned workflows that now exist.

## 2026-07 (current working tree)

### Added/changed

- Added property display schema/editor, reusable property cards/actions, media/document management, and related utility tests.
- Added cashback workspace, submission workflow, callable lifecycle management, audit logs, notifications, and indexes.
- Added feed banner administration and buyer carousel with function-managed Storage assets.
- Expanded property status and seller-association workflows.
- Updated buyer, seller, and admin responsive workspaces and Zinoo Design System v1.

> These items are present in the working tree. TODO: assign release identifiers after the changes are committed/released.

## 2026-07-18

- Refined buyer navigation and nearby/discovery experiences using existing project data.
- Added map quick-peek/zoom behavior and deterministic filtering.
- Kept `projects` as the buyer discovery source.

## 2026-07-13

- Added the first broad project documentation set. That set was later superseded because it mixed plans, speculation, and current implementation.

## Earlier foundation

- Created React/Vite PWA foundation.
- Integrated Firebase Auth, Firestore, Storage, and Hosting.
- Added initial buyer, seller, and admin components.
