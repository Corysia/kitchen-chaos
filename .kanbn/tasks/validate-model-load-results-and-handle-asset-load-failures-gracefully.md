---
created: 2026-09-16T04:26:10.155Z
updated: 2026-09-16T04:27:10.662Z
---

# Validate model load results and handle asset load failures gracefully

**Refs:** foo.md #17, TODO.md (Improve Error Handling).

**Problem:** `GameStage.loadKitchenCounters()`, `loadItems()`, and `createPlayer()` all access `result.meshes[0]` without checking that `result.meshes` is non-empty. If a `.glb` fails to load or contains no meshes, this throws a runtime error with no try/catch, aborting stage startup. The player visual load also has no guard.

**Acceptance tests:**
- Unit test (with mocked `ImportMeshAsync`): a model import returning an empty `meshes` array does not throw; the stage continues loading remaining assets and logs a warning.
- Unit test: an `ImportMeshAsync` rejection is caught, logged via `Logger.warn`/`Logger.error`, and the stage skips that asset gracefully instead of failing `GameStage.start()`.
- Unit test: a successfully loaded counter/item still gets added to the shadow generator and receives the material adjustment, proving happy-path behavior is unchanged.
- Unit test: when all model loads fail, `GameStage.start()` still completes and `applyPostProcessingEffects()` still runs.

## Sub-tasks

- [ ] Guard all result.meshes[0] accesses in loadKitchenCounters, loadItems, and createPlayer against empty mesh arrays.
- [ ] Wrap each ImportMeshAsync call in try/catch and emit Logger.warn/error instead of propagating raw exceptions.
- [ ] Consider parallelizing independent model loads with Promise.all to cut serial startup latency (counters then items).

## Relations

- [depends-on refactor-game-stage-into-services-and-externalize-hardcoded-asset-config](refactor-game-stage-into-services-and-externalize-hardcoded-asset-config.md)
