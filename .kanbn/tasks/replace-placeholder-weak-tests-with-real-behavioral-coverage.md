---
created: 2026-09-16T04:26:52.365Z
updated: 2026-09-16T04:27:14.716Z
---

# Replace placeholder/weak tests with real behavioral coverage

**Refs:** foo.md #18, #19, #20.

**Problem:** Test quality gaps:
1. `tests/main.test.tsx` is a placeholder (`expect(2).toBe(2)`, named `testAsuite`/`testA1`) — it should test the actual `Main` entry initialization.
2. `tests/Logger.test.ts` mostly asserts methods "don't throw"; it never verifies that log-level filtering actually suppresses/emits console output, and its "invalid input" tests (lines 86-124) verify no-crash rather than correct behavior.
3. `tests/StageManager.test.ts` builds mock stages with `as any` casts (lines 70-90, etc.), so interface contract violations are never caught by the type system.

**Acceptance tests:**
- Unit test: `main.test.tsx` is replaced with meaningful tests — e.g. verifying `Main.initialize()` creates a canvas, configures the engine/log level, adds a GameStage, and hides the loading UI (with engine/canvas mocked).
- Unit test: `Logger` filtering — with `console.log/warn/error` spied, setting `setLogLevel(ERROR)` emits `error` but suppresses `info`/`debug`/`warn`; setting `TRACE` emits all levels. Timestamp format is asserted in emitted output.
- Acceptance (StageManager): mock stages implement the real `Stage` interface (typed mocks, no `as any`); the suite still passes with the same behavior assertions; a deliberately-wrong stage shape fails to compile.
- Verification: `npm test -- --run` passes green after the test rewrite.

## Sub-tasks

- [ ] Write meaningful Main.initialize() entry-point tests to replace the placeholder main.test.tsx.
- [ ] Strengthen Logger.test.ts to spy on console and assert log-level filtering + timestamp output.
- [ ] Rewrite StageManager.test.ts mock stages as typed implementations of the Stage interface instead of as any objects.

## Relations

- [depends-on fix-windows-incompatible-scripts-and-type-check-the-tests-directory](fix-windows-incompatible-scripts-and-type-check-the-tests-directory.md)
