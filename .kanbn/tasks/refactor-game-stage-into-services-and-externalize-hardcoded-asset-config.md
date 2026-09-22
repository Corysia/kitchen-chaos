---
created: 2026-09-16T04:26:30.497Z
---

# Refactor GameStage into services and externalize hardcoded asset config

**Refs:** foo.md #4, #5.

**Problem:** `GameStage` (310 lines) violates the Single Responsibility Principle. It handles scene setup, asset loading, post-processing, ground creation, player creation, and mesh material adjustment in one class. Model paths and tuning values are hardcoded string literals (`./models/ClearCounter_Visual.glb`, metallic/roughness defaults, etc.) with no config seam for environment-specific overrides or testing.

**Acceptance tests:**
- Unit test: `GameStage` is constructible with injected services/config (e.g. an `AssetLoader` and a `GameConfig`) with no hardcoded model paths remaining in the stage itself.
- Unit test: overridden model paths/config propagate through the loader — loading uses the injected values, not literals.
- Unit test: material adjustment (PBR vs StandardMaterial branches) is exercised via the extracted service with unit tests that don't require a live scene.
- Unit test: GameStage can be tested with a mocked loader (empty mesh + error cases from the model-load-validation ticket) without instantiating real Babylon assets.
- Verification (no automated test): GameStage local scope is reduced to scene/camera/light/player orchestration.

## Sub-tasks

- [ ] Extract model asset loading (counters, items, player visual) into an AssetLoader service with configurable paths.
- [ ] Extract adjustMeshMaterials() into a dedicated material-adjustment service/utility.
- [ ] Move model paths, tuning values, and defaults into a GameConfig/constants module.
- [ ] Extract applyPostProcessingEffects() into a dedicated post-processing set-up helper.

## History

- type: created
  date: 2026-09-16T04:26:30.497Z
  column: To Do
  fromProgress: 0
  toProgress: 0
  author: Corysia Taware
