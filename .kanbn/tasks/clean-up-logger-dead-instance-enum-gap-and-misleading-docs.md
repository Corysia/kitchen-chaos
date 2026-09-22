---
created: 2026-09-16T04:26:42.464Z
---

# Clean up Logger dead instance, enum gap, and misleading docs

**Refs:** foo.md #6, #7, #8.

**Problem:** Three Logger issues:
1. `Logger.getInstance()` and `private static _instance` (Logger.ts:40, 50-55) are dead code — the class is entirely static and `getInstance` is never called anywhere in `src`.
2. `LogTimestampFormat` is sparse (`OFF = 0, LOCAL = 1, ISO = 3`) with an unexplained gap at 2 (Logger.ts:18-22).
3. The JSDoc claims the class "Automatically disables logging in production" (Logger.ts:26) while `production` is a module-load-time constant from `import.meta.env.PROD` — misleading about `setLogLevel()` having any effect in prod.

**Acceptance tests:**
- Unit test: the class exposes no live `getInstance()`/`_instance` (dead API removed); all logging still goes through static methods.
- Unit test: console.log/debug/info/trace output is gated by `setLogLevel()` in a non-prod test environment — lower-severity messages are suppressed and matching messages pass (see test-quality ticket: verify actual filtering).
- Unit test: `LogTimestampFormat` values are sequential (0..n) and `timestamp` returns ISO/local/'' respectively for each mode.
- Verification: JSDoc for the production behavior is corrected to state that production gating is fixed at build time.

## Sub-tasks

- [ ] Remove getInstance()/and the _instance field from Logger.
- [ ] Make LogTimestampFormat values sequential and explain each value.
- [ ] Correct the production-gating JSDoc (production is a build-time constant).

## History

- type: created
  date: 2026-09-16T04:26:42.464Z
  column: To Do
  fromProgress: 0
  toProgress: 0
  author: Corysia Taware
