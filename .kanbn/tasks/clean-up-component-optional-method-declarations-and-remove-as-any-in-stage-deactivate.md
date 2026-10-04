---
tags:
  - Bug
  - Medium
created: 2026-09-16T04:26:48.645Z
updated: 2026-09-23T15:48:29.293Z
---

# Clean up Component optional method declarations and remove as any in Stage.deactivate

**Refs:** foo.md #9, #26.

**Problem:** Two Component/Lifecycle cleanliness issues:
1. `Component` (Component.ts:46-66) declares `earlyUpdate?`, `update?`, `lateUpdate?`, `destroy?` as optional method signatures in the class body. They are abstract declarations (no bodies), not implementations — a confusing pattern; optionality belongs on the `Lifecycle` interface, not on the base class contract.
2. `Stage.deactivate()` (Stage.ts:130-136) dispatches `deactivate` by duck-typing (`'deactivate' in go`) and casting `(go as any).deactivate()` — a code smell. The `Lifecycle` interface already declares `deactivate?`, so the dispatch should use the typed interface (or a type guard) instead of `any`.

**Acceptance tests:**
- Unit test: the base `Component` no longer declares `?`-optional method signatures that read as implementations; subclasses override only what they implement, and the `Lifecycle` interface remains the single source of optionality.
- Unit test: a `Component` subclass that implements `update()` type-checks against `Lifecycle` exactly as before (no behavioral change).
- Unit test: `Stage.deactivate()` dispatches `deactivate` to GameObjects through the typed `Lifecycle` contract with no `as any` cast (compile-time), and objects without `deactivate` are skipped safely.
- Unit test: StageManager.update/lifecycle behavior is unchanged after the dispatch refactor.

## Sub-tasks

- [ ] Refactor Component so optional methods are declared via the Lifecycle interface only, with clear subclass override contracts.
- [ ] Refactor Stage.deactivate() to dispatch deactivate through the typed Lifecycle interface or a narrow type guard, eliminating the 'as any' cast.

## Relations

- [blocked-by inject-input-system-into-character-movement-and-unregister-listeners-on-destroy](inject-input-system-into-character-movement-and-unregister-listeners-on-destroy.md)
- [blocked-by deferred-safe-destruction-for-stage-remove-game-object](deferred-safe-destruction-for-stage-remove-game-object.md)
