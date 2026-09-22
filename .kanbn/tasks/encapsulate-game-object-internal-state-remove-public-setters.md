---
created: 2026-09-16T04:26:18.001Z
---

# Encapsulate GameObject internal state (remove public setters)

**Refs:** foo.md #10, #11.

**Problem:** Every `GameObject` property has a public setter (GameObject.ts:58-156). `name`, `transform`, `components`, `children`, `parent`, `awakeCalled`, and `startCalled` can all be mutated externally, bypassing invariants. The `awakeCalled`/`startCalled` setters allow resetting lifecycle flags — a destroyed object can be made to `awake()`/`start()` again. `addChild()`/`removeChild()` additionally mutate `children` through the setter (`child.parent.children = ...`, GameObject.ts:177), which is fragile if the setter is ever removed.

**Acceptance tests:**
- Unit test (compile-time where possible): public setters for `awakeCalled`, `startCalled`, `name`, `transform`, `components`, `children`, `parent` are removed or replaced with internal-only mutation paths (e.g. `private set` or a `markAwake()`-style method).
- Unit test: `addChild`/`removeChild` correctly reparent by using the internal children array, not the public setter, and update the child's transform parent.
- Unit test: lifecycle flags cannot be reset externally — after `awake()` a second `awake()` is a no-op and there is no public route to clear the flag.
- Unit test: existing GameObject hierarchy/dispatch behavior (awake/start/update/destroy propagation) is preserved after encapsulation.

## Sub-tasks

- [ ] Remove or privatize setters on name/transform/components/children/parent/awakeCalled/startCalled.
- [ ] Refactor addChild/removeChild to manipulate the internal child array without the public setter.
- [ ] Add internal lifecycle-flag mutation helpers (e.g. internal setter or dedicated methods) for the durable-write points.

## History

- type: created
  date: 2026-09-16T04:26:18.001Z
  column: To Do
  fromProgress: 0
  toProgress: 0
  author: Corysia Taware
