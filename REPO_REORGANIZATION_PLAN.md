# Repository Reorganization Plan (No Code Deletion)

This plan reorganizes the UniZy repository without deleting business logic, and minimizes risk by separating **move-only changes** from behavior changes.

## Goals

- Make code ownership clear by domain (`orders`, `delivery`, `housing`, `transport`, etc.).
- Keep App Router files focused on routing and UI composition.
- Extract business logic into testable modules.
- Improve test discoverability and enforce architecture boundaries.

## Guiding Rules

1. **No deletions of functional code during reorg** (archive or move instead).
2. **Move-only PRs first**, refactor internals second.
3. Keep compatibility re-exports during migrations.
4. Keep imports stable with aliases while paths move.
5. Run lint/tests after every migration phase.

## Target Architecture

```text
src/
  app/                          # Route handlers, pages, layouts only
    (public)/
    (auth)/
    (student)/
    (merchant)/
    (provider)/
    (driver)/
    (admin)/
    api/
  modules/                      # Domain business logic
    auth/
      actions/
      services/
      repo/
      validators/
      types/
    orders/
      actions/
      services/
      repo/
      policies/
      types/
    delivery/
    housing/
    transport/
    meals/
    finance/
    admin/
    notifications/
  shared/                       # Cross-domain code
    lib/
    ui/
    state/
    config/
    i18n/
    utils/

tests/
  unit/
  integration/
  e2e/

prisma/
  schema.prisma
  seeds/
    core.mjs
    auth.mjs
    commerce.mjs
  migrations/

scripts/
  qa/
  benchmark/
  seed/
  maintenance/

docs/
  architecture/
  runbooks/
```

## Current Problem Areas to Prioritize

- Very large action files (for example, orders) should be split into services + repo + actions wrappers.
- Duplicate/variant files with names like `* 2.js` should be normalized and tracked.
- Inconsistent route group folders should be corrected (e.g., malformed admin folder variants).
- Root-level miscellaneous files should be grouped into `docs/` and `scripts/` categories.

## Execution Roadmap

### Phase 0 — Baseline + Safety Nets

- Create branch for reorg effort.
- Capture baseline checks:
  - `npm run lint`
  - `npm test`
  - `npm run build`
- Create a migration ledger file (`docs/architecture/move-map.md`) with columns:
  - old path
  - new path
  - status
  - compatibility export added?

### Phase 1 — Repository Hygiene (Move-Only)

1. Create folders:
   - `docs/architecture`, `docs/runbooks`
   - `scripts/qa`, `scripts/benchmark`, `scripts/seed`, `scripts/maintenance`
2. Move root checklist/notes/docs/log files into `docs/runbooks` and `docs/architecture`.
3. Move scripts into categorized folders.
4. Keep filenames unchanged in this phase (except obvious malformed names when required).

Validation:

- `npm run lint`
- `npm test`

### Phase 2 — Shared Code Consolidation

1. Move shared code:
   - `src/lib` -> `src/shared/lib`
   - `src/components` -> `src/shared/ui`
   - `src/store` -> `src/shared/state`
   - `src/config` -> `src/shared/config`
   - `src/i18n` -> `src/shared/i18n`
2. Update aliases:
   - keep existing `@/*`
   - add `@shared/*`, `@modules/*`, `@app/*`
3. Run codemod/find-replace imports in small batches.

Validation:

- `npm run lint`
- `npm test`
- `npm run build`

### Phase 3 — Domain Module Introduction

1. Create `src/modules/<domain>/` for each domain.
2. Start with highest-complexity domains:
   - `orders`
   - `auth`
   - `delivery`
3. For each domain, split code into:
   - `actions/` (server action entrypoints)
   - `services/` (business logic)
   - `repo/` (Prisma access)
   - `policies/` (authorization/ownership)
   - `types/`

Validation per domain:

- targeted tests + full `npm test`
- smoke run of affected routes

### Phase 4 — App Router Thinning

1. Ensure files under `src/app/**` only perform:
   - route handling
   - input parsing
   - calling module actions/services
   - page composition
2. Move non-routing logic from route folders into `src/modules`.
3. Maintain compatibility exports from old action files until all imports are migrated.

Validation:

- `npm run lint`
- `npm test`
- `npm run build`

### Phase 5 — Test Architecture Cleanup

1. Introduce unified structure:
   - `tests/unit`
   - `tests/integration`
   - `tests/e2e`
2. Migrate legacy test locations incrementally.
3. Update Jest config `testMatch` to include new structure.
4. Keep old test paths temporarily until migration is complete.

Validation:

- `npm test`
- Optional coverage report

### Phase 6 — Prisma + Seed Organization

1. Keep one schema initially, but section by domain comments.
2. Split seed scripts by domain in `prisma/seeds/`.
3. Use a root seed orchestrator that runs each domain seed in order.
4. Standardize migration naming convention:
   - `YYYYMMDDHHMM_<domain>_<summary>`

Validation:

- `npx prisma generate`
- seed run in dev DB
- smoke checks for auth + ordering flows

### Phase 7 — Governance + Guardrails

1. Add import boundary lint rules:
   - `src/app` cannot import `repo` directly.
   - cross-domain imports go through public module entrypoints.
2. Add file size guidance (warn on very large files).
3. Add contribution rules for folder placement and naming.

Validation:

- CI lint/test/build
- architecture rule checks

## Suggested PR Sequence

1. `chore(repo): create docs/scripts structure and move operational files`
2. `refactor(shared): move shared libs, ui, stores, and i18n into src/shared`
3. `refactor(orders): extract service + repo layers from actions`
4. `refactor(auth): extract service + repo layers from actions`
5. `refactor(delivery): extract service + repo layers from actions`
6. `test: migrate tests into tests/{unit,integration,e2e}`
7. `chore(prisma): split seeds by domain and add orchestrator`
8. `chore(ci): enforce architecture boundaries`

## Definition of Done (Reorg)

- [ ] All route files are thin and domain logic is outside `src/app`.
- [ ] Shared utilities/UI/state are under `src/shared`.
- [ ] Main domains have module folders with clear layers.
- [ ] Duplicate variant filenames have been normalized.
- [ ] Test structure is standardized and green.
- [ ] Prisma seeds are modularized.
- [ ] CI enforces boundary and quality rules.
- [ ] Architecture docs and move-map are complete.

## First Sprint Scope (Recommended)

To de-risk, execute only:

1. Phase 1 (repo hygiene)
2. Phase 2 (shared code consolidation)
3. Orders domain extraction only (Phase 3 partial)

This gives immediate structural improvements without requiring full-domain migration in one pass.
