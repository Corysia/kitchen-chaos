---
created: 2026-09-16T04:26:35.825Z
updated: 2026-09-16T04:27:14.285Z
---

# Deferred/safe destruction for Stage.removeGameObject

**Refs:** foo.md #3, #27.

**Problem:** `Stage.removeGameObject()` (Stage.ts:102-108) calls `gameObject.destroy()` synchronously (and without awaiting its Promise) while iterating. If the object (or its transform) is still referenced elsewhere, disposal happens immediately with no chance to defer. `GameObject.destroy()` (GameObject.ts:282-293) also interleaves recursive child destruction with `this.transform.dispose()`; the ordering is fragile — a child removed from the `children` array beforehand will never have its transform disposed, leaking scene nodes.

**Acceptance tests:**
- Unit test: `removeGameObject()` defers/queues actual destruction when the caller requests soft removal; the object remains valid until destruction is flushed.
- Unit test: `removeGameObject()` fully awaits the destroy lifecycle (a spy on `GameObject.destroy` is awaited) rather than fire-and-forget.
- Unit test: calling `removeGameObject` during iteration over `gameObjects` does not mutating the array mid-iteration in a way that skips other objects.
- Unit test: every child GameObject still in the `children` array at disposal has its own transform disposed; no scene node leaks from orphaned children.

## Sub-tasks

- [ ] Make removeGameObject async (or queue destruction) so destroy() is awaited and can be deferred.
- [ ] Make GameObject.destroy() idempotent and ensure transform disposal is ordered after child destruction for the full subtree.
- [ ] Ensure removed GameObjects are dropped from arrays without mid-iteration mutation hazards.

## Relations

- [depends-on encapsulate-game-object-internal-state-remove-public-setters](encapsulate-game-object-internal-state-remove-public-setters.md)
