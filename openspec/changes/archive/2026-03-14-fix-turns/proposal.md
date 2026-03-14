## Why

Turn progression can become inconsistent when cascades are still resolving after a move. If the turn changes too early, another player may attempt a move before all pending explosions are finished, causing rule and synchronization issues.

## What Changes

- Enforce explosion-completion gating for turn progression: turn SHALL NOT change until no pending explosions remain.
- Enforce move blocking during cascade resolution: no player other than the active resolving move may place atoms while explosions are still pending.
- Ensure explosion completion is verified after each explosion step and before allowing turn handoff.
- Keep existing socket event names and payload schema unchanged.
- Add/update tests for turn lock, move rejection during pending explosions, and correct turn release after cascade completion.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chain-reactions`: Clarify and enforce completion checks after each explosion step and define when cascade is fully done.
- `player-actions`: Clarify move-permission rules so moves are rejected while cascade resolution is still in progress.
- `game-state`: Clarify turn transition timing so turn changes only after cascade completion.

## Impact

- Affected code: server cascade resolution flow, turn-switch sequencing, and move validation guards during in-progress cascades.
- Affected tests: unit/integration tests for turn changes and move validation; E2E tests for blocked moves until all explosions complete.
- APIs/dependencies: no new dependencies and no protocol changes expected.
