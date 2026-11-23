# Casa Italy

Standalone Casa Italy restaurant menu and landing page, migrated from `3d-menu-ui` without redesigning the interface.

- `/`: animated pizza menu, category filters, and Casa story dialog.
- `/landing`: kitchen video, featured pizzas, contact panel, and browser-local reservation/feedback demos.

## Local development

Requires Node.js 24.x and pnpm 10.34.5.

```sh
pnpm install
pnpm dev
```

## Verify and run production

```sh
pnpm exec tsc --noEmit
pnpm lint
pnpm test
pnpm build
pnpm start
```

`pnpm build` generates standalone output and automatically packages public assets and Next.js static files. `pnpm start` launches `.next/standalone/server.js`. Supply host and port through the environment when needed.

See [deployment preparation](docs/deployment.md) for Linux packaging and cPanel/Passenger validation requirements, and [migration inventory](docs/migration-inventory.json) for the audited source files and SHA-256 checksums.

The application has no backend/database dependency and needs no application secrets. Reservations and feedback preserve the original demo behavior: they are stored only in the current browser and are never sent to the restaurant.
