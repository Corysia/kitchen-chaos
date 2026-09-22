---
created: 2026-09-16T04:26:58.471Z
updated: 2026-09-16T04:27:13.237Z
---

# Harden Babylon.js integration: loaders once, non-null shadows, engine option parity

**Refs:** foo.md #14 (rejected — see note), #15, #16. NEW: WebGL fallback options parity.

**Problems (Babylon.js integration):**
1. `registerBuiltInLoaders()` is a global side effect called inside `GameStage.awake()` (GameStage.ts:27); if multiple stages load models it runs repeatedly.
2. `_shadowGenerator` is typed `ShadowGenerator | undefined` (GameStage.ts:18) and optional-chained everywhere, even though it is unconditionally set in `awake()` — inconsistent nullability that forces `?.` at every call site.
3. NEW: the WebGL fallback in `main.ts` (line 79) uses a bare `new Engine(this.canvas, true)`, dropping the extensive options passed to the WebGPU path (`preserveDrawingBuffer`, `stencil`, `antialias`, `alpha`, `adaptToDeviceRatio`, `powerPreference`, etc.), so the fallback rendering behaves differently.

**Note on foo.md #14:** the `FreeCamera` constructor usage `new FreeCamera("camera1", position, scene)` is the correct Babylon.js signature, not a bug; no ticket created for it.

**Acceptance tests:**
- Unit test: `registerBuiltInLoaders` is invoked exactly once during app startup (moved to `main.ts` or wrapped in an idempotent guard).
- Unit test: `_shadowGenerator` is non-optional after `awake()` and the casters are added without `?.` guards; a direct assert verifies it is defined immediately after awake.
- Acceptance (manual/verification): the WebGL fallback receives the same engine options as the WebGPU path (extract shared options into a constant) so rendering parity holds on non-WebGPU devices.

## Sub-tasks

- [ ] Move registerBuiltInLoaders() out of GameStage.awake() to the main entry point and make it idempotent.
- [ ] Make _shadowGenerator non-nullable and initialize it during awake() so optional chaining is removed.
- [ ] Extract a shared engine-options constant and pass it to both the WebGPU and WebGL fallback Engine constructors.

## Relations

- [depends-on refactor-game-stage-into-services-and-externalize-hardcoded-asset-config](refactor-game-stage-into-services-and-externalize-hardcoded-asset-config.md)
