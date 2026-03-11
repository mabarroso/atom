## Why

The UI currently shows a turn counter, but players reason about match progress in rounds (a full cycle of play), not individual turns. Replacing the turn counter with a round counter improves readability and makes progression easier to understand in both human-vs-human and human-vs-machine games.

## What Changes

- Replace the visible turn counter in the gameplay UI with a round counter.
- Define authoritative round semantics in game state and synchronization payloads.
- Ensure round progression is consistent across player-vs-player and player-vs-machine modes.
- Ensure reconnect/state resync restores the correct round value.
- Keep game rules unchanged; this change only updates progression representation and display.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `game-ui`: Replace turn-counter display behavior with round-counter display behavior and update related UI expectations.
- `game-state`: Replace authoritative turn-number progression exposure with authoritative round-number progression exposure and synchronization requirements.

## Impact

- Affected code: server game-state serialization, socket state payload fields, and client gameplay status rendering.
- Affected tests: unit and E2E tests for progression display/update behavior, reconnect flows, and machine-mode progression.
- APIs/dependencies: state payload field usage may shift from turn-oriented naming/semantics to round-oriented naming; no new external dependencies expected.
