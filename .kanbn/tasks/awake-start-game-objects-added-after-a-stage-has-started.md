---
created: 2026-09-16T04:26:22.993Z
updated: 2026-09-16T04:27:13.698Z
---

# Awake/start GameObjects added after a stage has started

**Refs:** NEW (not in foo.md).

**Problem:** `Stage.addGameObject()` (Stage.ts:94-96) only pushes onto `gameObjects`. But `GameStage.start()` creates the player and calls `this.addGameObject(player)` AFTER `super.start()` has already snapshot the stage's gameObjects lifecycle. As implemented, a GameObject added after the stage is started never receives `start()` on itself or its components (its components get `awake()` only because `GameObject.addComponent()` calls it manually, GameObject.ts:166). The Lifecycle contract (awake -> start -> earlyUpdate/update/lateUpdate) is violated: `CharacterMovementComponent.update()` runs without ever having `start()` invoked.

**Acceptance tests:**
- Unit test: adding a GameObject to a started stage automatically invokes `awake()` and `start()` on the GameObject, its components, and its children before the next `update()`.
- Unit test: adding a GameObject to a not-yet-started stage behaves as today (lifecycle runs when the stage itself wakes/starts).
- Unit test: the add-after-start path is idempotent — `start()` is invoked exactly once for the added GameObject.
- Unit test: newly added GameObjects participate in the update/lateUpdate loop in the same frame they are added.

## Sub-tasks

- [ ] Detect stage started state in Stage.addGameObject and dispatch awake()+start() on the newly added GameObject (and descendants) when the stage has already started.
- [ ] Consolidate the path where GameObject.addComponent fires component.awake() so lifecycle ordering is consistent regardless of when the object is added.
- [ ] Add coverage for the GameStage.start() player-add path explicitly (player created after counters/items load).

## Relations

- [depends-on encapsulate-game-object-internal-state-remove-public-setters](encapsulate-game-object-internal-state-remove-public-setters.md)
