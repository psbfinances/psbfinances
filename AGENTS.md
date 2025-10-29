# Repository Guidelines

## Project Structure & Module Organization
The workspace is split across `server`, `web`, and `shared` packages. Server-side logic lives under `server`, with REST handlers in `server/api`, middleware in `server/middleware`, and integration helpers in `server/dip`. Front-end code sits in `web`, where `web/components` holds React views and `web/stores` encapsulates state. Shared domain models and utilities are in `shared`. Tests follow their features via `__tests__` folders, and build artifacts land in `build/` or `dist/`; avoid committing those outputs.

## Build, Test, and Development Commands
- `npm install` — install workspace dependencies; run at repo root.
- `npm run start:web` — launch the webpack dev server on the front end.
- `npm run start:server` — start the Express API in dev mode (`NODE_ENV=dev`).
- `npm run build` — create a deployable bundle under `build/`, syncing server/shared code and compiling the web client.
- `npm test` — execute Jest suites for both server and web packages.
- `npm run deploy` — run `scripts/deploy.sh`; coordinate with maintainers before invoking.

## Coding Style & Naming Conventions
This project uses StandardJS (2-space indent, no semicolons) and ES modules. Controllers, services, and stores use lower camelCase filenames (`accountController.js`), while directories stay kebab or lower-case. Keep shared code TypeScript-friendly and update `.d.ts` files in `typeDef/` as needed. Run `npx standard` locally when touching JavaScript-heavy areas.

## Testing Guidelines
Unit and integration tests use Jest with `jest-environment-node` on the server and the default DOM environment on the web client. Place new specs alongside code in feature-level `__tests__` directories and name them `<feature>.test.js`. Favour realistic data fixtures from `data/` when covering financial calculations. Maintain or improve coverage around transaction merging, budgeting, and authentication flows before requesting review.

## Commit & Pull Request Guidelines
Commits follow concise, imperative messages (for example, `Fix mergeTransactions to reassign child transactions`). Scope each change to a coherent unit and include migration notes in the body when configs or data imports change. Pull requests should link related issues, describe data or schema impacts, and capture manual validation steps (screenshots or curl commands for API endpoints). Tag reviewers across server and web when the change spans both layers.

## Security & Configuration Tips
Keep secrets out of source control; local overrides belong in `server/config/config.dev.yaml` or environment variables. Mask any sample exports placed in `data/` or `logs/`. When adding new external integrations, document required keys in `Notes.md` and update deployment scripts accordingly.
