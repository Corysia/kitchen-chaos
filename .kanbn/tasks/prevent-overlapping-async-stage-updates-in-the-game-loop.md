---
tags:
  - Bug
  - Critical
created: 2026-09-16T04:26:05.195Z
updated: 2026-09-23T15:20:29.207Z
---

# Prevent overlapping async stage updates in the game loop

**Refs:** foo.md #1, #25. NEW: `StageManager.update()` (StageManager.ts:165-171) is a second, unused update path; the only live path is the `onBeforeRenderObservable` callback (StageManager.ts:150-157).

**Problem:** The `onBeforeRenderObservable` callback in `StageManager.setActiveStage()` is `async`, but Babylon.js observables do not await promises. If a stage's `update()` is slow or stalls, callbacks queue up across frames, causing frame stutter and out-of-order updates. Additionally, if `stage.update()` rejects, the rejection is unhandled and the callback keeps running against a broken stage state.

**Acceptance tests:**
- Unit test: when a stage's `update()` takes longer than one frame to resolve, no overlapping/duplicate update is dispatched for that stage while the previous one is still in flight.
- Unit test: a rejected `stage.update()` is caught; no unhandled promise rejection escapes the loop, and the error handler / stage deactivation path is invoked.
- Unit test: exactly one update path executes per frame — either `StageManager.update()` or the observable callback, never both, so `update()` is not called twice per frame.
- Unit test: a stage whose update continuously fails is deactivated (its callback removed) after the configured failure threshold.

## Sub-tasks

- [ ] Introduce a frame scheduler in StageManager that queues pending updates and cancels/drops stale ones when a previous update is still in flight.
- [ ] Wrap the observable callback in try/catch and deactivate the stage on persistent update errors instead of leaving a broken callback registered.
- [ ] Reconcile the duplicate update paths: remove the dead public StageManager.update() or route it through the same scheduler so update() is never invoked twice per frame.
