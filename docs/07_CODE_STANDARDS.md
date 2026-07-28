# Code Standards for AI Agents

## Required workflow

1. Read `00_AI_CONTEXT.md`.
2. Read the target source files and the applicable detailed document/feature file.
3. Check `git status`; preserve unrelated user changes.
4. Make the smallest scoped change.
5. Run the narrowest relevant tests, then `npm test` and/or `npm run build` when appropriate.
6. Update documentation and `08_CHANGELOG.md` when behavior, schema, navigation, dependencies, or rules change.

## Hard constraints

- Never rename a Firestore collection, Storage prefix, callable function, permission key, or canonical status without an approved migration.
- Never make a property buyer-visible unless its exact status is `active`.
- Never implement protected lifecycle transitions as direct client writes.
- Never let profile UI change `permissions`.
- Never introduce dependencies, routers, state libraries, frameworks, or SDKs without explicit approval.
- Never use invented seed data, counts, scores, testimonials, locations, prices, or analytics.
- Never create placeholder behavior presented as working.
- Never refactor unrelated files or rewrite working code for style.
- Never remove legacy field compatibility without migration evidence.
- Never expose secrets in documentation, logs, or new client code.

## React

- Use functional components and hooks.
- Keep local UI state local; theme remains context-based.
- Reuse existing components and utilities before creating variants.
- Prefer derived values (`useMemo` where materially useful) over duplicated state.
- Clean up listeners, browser events, timers, map objects, and Storage tasks.
- Preserve role-specific prop contracts in `App.jsx`.
- Maintain accessible labels, semantic controls, keyboard behavior, and error/status roles.

## Firebase

- Initialize client services only through `src/firebaseConfig.js`.
- Always target Firestore database `default` consistently.
- Treat rules/functions as part of every data-model change.
- Use `serverTimestamp()`/`FieldValue.serverTimestamp()` for authoritative timestamps.
- Keep owner fields immutable where rules require it.
- Create necessary indexes for new compound queries; document them.
- Prefer callable transactions for multi-document or privileged transitions.
- Log identifiers and error codes, not confidential document content.

## Domain data

- Use constants/utilities:
  - `PROPERTY_STATUS` and `normalizePropertyStatus`
  - `isPublicProperty`/`isProjectPublishable`
  - permission normalization helpers
  - land, area, geometry, purchase-value, and display-model utilities
- Preserve exact case-sensitive workflow statuses.
- New fields require documentation of type, source, nullability, readers, writers, and security expectations.
- Unknown schema facts must be `TODO`, not inferred.

## Styling

- Treat `src/styles/druvio-design-system-v1.css` as final authority.
- Use `--ds-*` tokens and shared component classes first.
- Avoid inline styles except dynamic geometry/order/value cases that cannot be expressed cleanly by class.
- Use Lucide outline icons; do not mix icon systems.
- Respect reduced motion and current responsive breakpoints.

## Testing

- Pure business/domain utilities require unit tests.
- Rule changes require emulator rule tests before production deployment. TODO: harness does not yet exist.
- Callable changes require authentication, authorization, validation, happy-path, invalid-transition, and transaction tests. TODO: harness does not yet exist.
- UI changes require at least loading, empty, error, narrow viewport, and permission visibility checks.
- Do not claim a test passed unless it was run.

## Documentation boundaries

- Current implementation → `01_CURRENT_STATE.md`.
- Architecture/data flow → `02_ARCHITECTURE.md`.
- Schema/security/indexes → `03_DATABASE.md`.
- Screen graph → `04_NAVIGATION.md`.
- Visual/interaction constraints → `05_UI_RULES.md`.
- Domain policy → `06_BUSINESS_RULES.md`.
- One feature's end-to-end contract → `features/`.
- Work not implemented → `tasks/`.
- Why a durable architecture choice exists → `decisions/`.
