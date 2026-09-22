---
created: 2026-09-16T04:26:54.855Z
---

# Fix Windows-incompatible scripts and type-check the tests directory

**Refs:** foo.md #22, #23.

**Problem:** Two tooling issues:
1. `package.json` `nuke` and `clean` scripts use `rm -rf` (package.json:12-13), which is not native on Windows (this project already targets Windows dev).
2. `tsconfig.json` `include: ["src"]` (tsconfig.json:24) excludes `tests/`, so test files are not type-checked under the strict settings (`noUnusedLocals`, `noUnusedParameters`) — which is a big reason the `as any` mocks went unnoticed.

**Acceptance tests:**
- Verification/CI: `npm run clean` (and `nuke`, guarded) complete successfully on Windows.
- Verification: `npx tsc --noEmit` (or `npm run build`) type-checks the `tests/` directory with the strict tsconfig; deliberately introducing a type error in a test file fails the build.
- Verification: existing `npm test -- --run` still passes after the tsconfig change (Vitest is unaffected by the tsconfig include).

## Sub-tasks

- [ ] Replace rm -rf usage in nuke/clean with rimraf (or node -e) and add rimraf to devDependencies.
- [ ] Add tests/ to tsconfig include (or introduce a tsconfig.tests.json) so strict linting applies to test files.

## History

- type: created
  date: 2026-09-16T04:26:54.855Z
  column: To Do
  fromProgress: 0
  toProgress: 0
  author: Corysia Taware
