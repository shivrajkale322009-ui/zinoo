# Public project SEO release runbook

Use this order for a controlled production release:

1. Deploy the reviewed Firestore rules and indexes.
2. Deploy the corrected public-project projection trigger.
3. Open a controlled migration window; do not run an older trigger concurrently.
4. Run `npm run migrate:public-projects:dry-run` from `functions/` and review every project, slug owner, collision, location identity, and action.
5. Resolve every reported collision before continuing.
6. Apply only after review by setting `ZINOO_PUBLIC_MIGRATION_CONFIRMED=corrected-trigger-deployed` and running `npm run migrate:public-projects`.
7. Repeat the dry run and confirm all actions are stable/preserved. The migration is transactionally idempotent.

The migration refuses `--apply` without the explicit corrected-trigger confirmation. It reconciles source projects plus orphaned public projections and slug registries, so reruns also clean stale public identities without recreating missing source projects.

Project URLs with a trailing slash currently return the same `200` representation as the non-trailing form. Both emit the non-trailing canonical URL (for example, `/projects/example`). This behavior is regression-tested; no broad redirect policy is introduced.
