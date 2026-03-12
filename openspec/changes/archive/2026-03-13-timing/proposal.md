## Why

Gameplay pacing is currently fixed, which limits accessibility and user preference across devices and play styles. Allowing players to tune animation speed and machine response time improves usability while preserving game rules and determinism.

## What Changes

- Add a user-facing control in the web UI to modify chain-reaction animation speed.
- Add a user-facing control in the web UI to modify machine response time.
- Allow machine response delay to be configured down to `0 ms` (reduced to zero, not removed behaviorally).
- Keep machine turns and animation sequencing functionally identical; only timing is adjusted.
- Ensure timing values are consistently applied in active gameplay updates and preserved during state refresh/reconnect for the current session.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `game-ui`: Add controls for animation speed and machine response delay, and define visible behavior when values change.
- `chain-reactions`: Update animation delay behavior to use configurable timing instead of fixed delay.
- `machine-player`: Update machine move scheduling to use configurable response delay including `0 ms`.

## Impact

- Affected code: client UI controls, animation queue timing usage, server machine move scheduling, and timing propagation/synchronization paths.
- Affected tests: unit tests for timing configuration handling, and E2E tests validating speed changes and `0 ms` machine response configuration.
- APIs/dependencies: may require extending socket payloads/state fields for timing settings; no new external dependencies expected.