---
created: 2026-09-16T04:26:14.165Z
---

# Inject InputSystem into CharacterMovement and unregister listeners on destroy

**Refs:** foo.md #12, #13, #21, #28. NEW: listener leak on destroy.

**Problems:**
1. `CharacterMovementComponent.awake()` reaches into `StageManager.instance.activeStage` (CharacterMovement.ts:26-29), hard-coupling the component to the singleton and making it untestable without a fully initialized `GameStage`.
2. `forward`, `backward`, `left`, `right`, `jumpRequested` are public mutable fields (CharacterMovement.ts:43-47) — external mutation bypasses any invariants.
3. NEW: `destroy()` (CharacterMovement.ts:52-54) only calls `super.destroy?.()` and never unregisters the five input listeners registered in `awake()`. The arrow-function closures keep the component alive after destruction and callbacks fire against a destroyed component — a memory/behavior leak.
4. `update()` does not clamp `dt`, so a large frame spike (tab switch) can cause excessive teleportation.
5. Many tests in CharacterMovementComponent.test.ts assert throw/no-throw and NaN behavior instead of validating inputs at the source.

**Acceptance tests:**
- Unit test: the component can be constructed and `awake()`d with an injected mock `InputSystem` that implements the `on/off` contract, without requiring a staged `StageManager`.
- Unit test: calling `destroy()` unregisters all registered action callbacks (spy on `input.off` for each of the five actions).
- Unit test: movement state (`forward`, etc.) is no longer externally assignable (compile-time: property has no public setter) — behavior tests drive state via `InputSystem` callbacks.
- Unit test: with a very large `dt` (e.g. 10s), displacement is no greater than `speed * maxClamp` (e.g. 0.1s), and non-finite `dt`/NaN inputs do not move the transform to NaN.
- Unit test: diagonal movement normalization and speed scaling still hold (existing expectations preserved).

## Sub-tasks

- [ ] Add constructor injection for InputSystem (remove direct StageManager.instance access from awake()).
- [ ] Make forward/backward/left/right/jumpRequested private with read-only getters.
- [ ] Unregister all input listeners for the five InputActions in destroy().
- [ ] Clamp delta time to a maximum (e.g. 0.1s) and guard non-finite speed/dt values in update().
- [ ] Replace throw/no-throw 'handle invalid gracefully' tests with behavior-focused tests that validate inputs at the source.

## History

- type: created
  date: 2026-09-16T04:26:14.165Z
  column: To Do
  fromProgress: 0
  toProgress: 0
  author: Corysia Taware
