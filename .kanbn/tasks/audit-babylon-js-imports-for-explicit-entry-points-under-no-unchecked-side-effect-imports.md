---
created: 2026-09-16T06:00:42.597Z
---

# Audit Babylon.js imports for explicit entry points under noUncheckedSideEffectImports

**Refs:** foo.md #24.

**Problem:** `tsconfig.json` enables `noUncheckedSideEffectImports` (tsconfig.json:21). Under this flag every import must resolve to a declared export in the target package's export map; wildcard/barrel imports (e.g. `@babylonjs/core` root) or side-effect-only imports of non-exported files fail type-checking and can silently change tree-shaking/bundling behavior. The codebase has not been audited for compliance, so a stray barrel or side-effect import could compile today only because it happens to resolve — or fail on a package upgrade.

**Acceptance tests / verification:**
- Verification: `npx tsc --noEmit` passes with `noUncheckedSideEffectImports` enabled (already on) after the audit, with zero unresolved/wildcard imports flagged.
- Verification: no `@babylonjs/core` (or other scoped `@babylonjs/*`) import in `src/`/`tests/` uses the package root or a wildcard/barrel path; every import targets an explicit entry point or a declared side-effect export.
- Unit/CI: deliberately introducing a wildcard `import` of a non-exported module fails `tsc --noEmit` — proving the setting is enforced, not bypassed.
- Verification: `npm run build` and `npm test -- --run` still pass after import adjustments.

## Sub-tasks

- [ ] Inventory every `@babylonjs/*` (and other scoped) import in `src/` and `tests/`; flag root, wildcard, and side-effect-only imports.
- [ ] Convert flagged imports to explicit entry-point imports (or declared side-effect exports), verifying each against the package export map.
- [ ] Add a CI/build guard so future imports that violate `noUncheckedSideEffectImports` fail the type-check.

## History

- type: created
  date: 2026-09-16T06:00:42.597Z
  column: To Do
  fromProgress: 0
  toProgress: 0
  author: Corysia Taware
