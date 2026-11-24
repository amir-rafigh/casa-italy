# Casa Italy

Local restaurant MVP with a PostgreSQL-backed animated menu, landing page, authenticated administration and table reservations. All prices and bookings are synthetic demo data; SMS is intentionally excluded.

- `/`: animated menu with categories, demo prices and availability.
- `/landing`: restaurant introduction and database-backed contact/reservation panels.
- `/reservations`: create, track and cancel bookings from the same browser.
- `/admin`: menu, categories, reservations, slot capacity, settings and accounts.
- `/Menu`: permanent redirect to `/`, preserving query parameters.

## Local setup

Node.js 24, pnpm 10.34.5, Docker Desktop and Chrome are required.

```sh
pnpm install --frozen-lockfile
pnpm local:setup
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm admin:create
pnpm dev
```

Open http://localhost:3000/admin. Generated local credentials are in `tmp/local-admin.txt` (git ignored). Secrets live in `.env.local`, also ignored. Existing environment files and admin passwords are preserved when setup is rerun.

Read the [Persian local guide](docs/local-mvp.md) for all features, database access, backup/restore, browser ownership, reservation policies and local mobile testing.

## Verification

```sh
pnpm exec tsc --noEmit
pnpm lint
pnpm test
pnpm test:db
pnpm db:compat
pnpm test:compat
pnpm build
pnpm start
pnpm test:e2e
node scripts/smoke-standalone.mjs http://localhost:3000
pnpm db:verify-restore
```

Stop the old standalone server before rebuilding on Windows. DB tests create and remove a dedicated temporary local database; they refuse remote targets. Compatibility tests run against exactly PostgreSQL 10.23 in a separate Docker container. Browser tests use installed Chrome and a local server; fixtures are synthetic.

## Packaging and hosting

`build` packages assets, excludes dotenv secrets and includes private migration/seed scripts under standalone/ops. Internal PDFs are outside public. Production deployment has not been performed for this MVP. The user will approve a separate step-by-step hosting transfer after local acceptance. See [deployment preparation](docs/deployment.md).

Feedback remains an explicitly labelled localStorage demo. SMS, real restaurant data, image uploads, customer accounts and online payments are outside this phase.
