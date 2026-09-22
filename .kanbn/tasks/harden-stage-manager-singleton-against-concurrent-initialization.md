---
created: 2026-09-16T04:26:38.908Z
---

# Harden StageManager singleton against concurrent initialization

**Refs:** foo.md #2.

**Problem:** `StageManager.initialize()` (StageManager.ts:100-106) uses a check-then-act guard (`if (StageManager._instance) throw`). In SSR/edge or other concurrent async contexts, two callers can pass the guard before either assigns `_instance`, yielding two "singletons". Tests already reset the singleton by reaching into `(StageManager as any)._instance = null`, which is a strong sign the encapsulation is leaky.

**Acceptance tests:**
- Unit test: concurrent/re-entrant initialization (simulated via serial/async interleaving, or a globalThis-backed guard) cannot yield two distinct instances.
- Unit test: `initialize()` is idempotent — a second call returns the existing instance (or throws predictably) and never corrupts state; behavior is documented and asserted.
- Unit test: the singleton can no longer be reset via an `as any` cast to a private field without also updating the documented test hook (i.e. add a proper `reset()`/`_resetForTesting()` API instead of reaching into `_instance`).
- Unit test: engine accessor and stage management behave identically after the guard change.

## Sub-tasks

- [ ] Replace the check-then-act guard with an atomic/globalThis-backed guard that prevents concurrent double-initialization.
- [ ] Add a formal test reset hook for the singleton instead of mutating the private _instance field via as any.
- [ ] Document and lock down initialize() idempotency semantics (return existing vs throw) in the JSDoc and in tests.

## History

- type: created
  date: 2026-09-16T04:26:38.908Z
  column: To Do
  fromProgress: 0
  toProgress: 0
  author: Corysia Taware
