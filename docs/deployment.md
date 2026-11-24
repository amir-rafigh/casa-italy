# Standalone deployment

Use Node.js 24.x and pnpm 10.34.5. The MVP now requires PostgreSQL, DATABASE_URL, NEXTAUTH_SECRET, APP_ORIGIN and NEXTAUTH_URL. This document is deployment preparation only; hosting transfer is deferred until user approval. See local-mvp.md for local setup and verification.

## Build and package

Run on Linux matching the hosting OS and CPU architecture:

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm lint
pnpm test
pnpm build
```

The build's `postbuild` script runs `pnpm package:standalone`, copying `public/` and `.next/static/` into `.next/standalone/`. Next.js does not include those directories automatically. The resulting folder contains `server.js`, traced dependencies, `.next/`, and `public/`. Do not upload the Windows build to Linux: native modules differ, and Windows pnpm junctions may contain absolute paths. Transfer the Linux-generated folder with hidden files and symlinks preserved.

From the project checkout, `pnpm start` launches the packaged server. From the packaged folder, run `node server.js`. `PORT` and `HOSTNAME` may be supplied by the environment; no production values are prescribed by the application.

For a locally running production server, validate with:

```sh
node scripts/smoke-standalone.mjs http://127.0.0.1:3107
```

Here `3107` is only an example local test port; configure the test server accordingly. The script checks both routes, linked Next.js assets and fonts, every public file, optimized product images, byte-range video responses, internal links, and absence of unrelated routes.

## cPanel / CloudLinux / Passenger

The proposed application root is the contents of the Linux-built standalone folder, with startup file `server.js`, application mode `production`, and Node.js 24.x selected in the host's application manager. Check that the provider actually offers Node.js 24 and permits this startup filename. Some cPanel installations default to `app.js`; use the provider's supported startup-file configuration instead of editing Next.js's generated server.

Passenger handles server binding through its own reverse port binding mechanism. Do not introduce PM2, a second server, Docker, or a fixed production port. The hosting configuration and Passenger version must be validated on the actual host. See [cPanel's Node.js application guide](https://docs.cpanel.net/knowledge-base/web-services/how-to-install-a-node.js-application/), [CloudLinux's selector configuration reference](https://docs.cloudlinux.com/cloudlinuxos/command-line_tools/), and [Passenger reverse port binding](https://www.phusionpassenger.com/docs/advanced_guides/in_depth/node/reverse_port_binding.html).

After future deployment, verify `/`, `/landing`, client navigation, optimized images, local fonts, video byte ranges, application startup/restart, writable Next.js image cache, and provider memory/process limits. Inspect Passenger logs for spawn or port-binding failures. None of these remote checks has been performed by this migration.

## MVP data and operational scripts

The packaged `ops/` folder contains SQL migrations, synthetic seed data and CLI scripts. It resolves pg from the parent standalone node_modules. Run those scripts from an activated Node24 environment with secrets supplied by the hosting environment. Do not run migration or seed from the web server startup path.

- `node ops/scripts/db-check.mjs`: connectivity, server version and migration status.
- `node ops/scripts/db-migrate.mjs`: checksum-verified, locked, transactional migrations.
- `node ops/scripts/db-seed.mjs`: insert missing synthetic catalog/settings without overwriting administrator edits.
- `node ops/scripts/admin-user.mjs`: explicitly provision an account; no default password.

Before any future remote migration, inspect existing tables, permissions and the exact database target, then take a verified backup. Keep migration changes additive and retain the previous web release. A web rollback must not run automatic down migrations. Existing host data must not be reset or replaced by a local test dump.

Dotenv files are removed from the standalone artifact. Supply secrets at runtime; never put them under public or public_html. On Linux, `node server.js` remains the startup entry. The local package.json start command reads `.env.local` only for laptop testing.

The small pool defaults to three connections per web process. Passenger process count multiplied by pool size must fit the host database quota. The actual host's Node-to-PostgreSQL connection, resource limits and migration permissions must still be verified during the user-approved transfer.

## Current feature boundaries

Menu, reservation and administration data are now persistent PostgreSQL data. Feedback remains a browser-local demo. SMS, image uploads and real restaurant data are excluded from this phase. Browser reservation ownership is cookie-based; losing that cookie does not provide an automatic phone-based recovery flow.

No MVP release, migration or seed has been run on the host in this local implementation task.
