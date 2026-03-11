## Why

Players currently cannot see a quick summary of atom distribution per player and total atoms on the board. Adding board-level atom counters improves situational awareness, while keeping them hidden by default preserves the intended gameplay until Player 1 explicitly reveals them.

## What Changes

- Add atom counters to the game board UI for Player 1 atoms, Player 2 atoms, and total atoms.
- Keep atom counters hidden by default when a game starts or is restarted.
- Add a Player 1-controlled action to reveal counters, making them visible to all connected players.
- Ensure revealed/hidden visibility state is synchronized authoritatively and preserved across state updates and reconnection.
- Keep game mechanics unchanged; this feature only affects informational UI visibility.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `game-ui`: Add hidden-by-default atom counter panel and revealed-state rendering for both players.
- `game-state`: Add authoritative atom-counter visibility state and synchronization behavior across clients/reconnect.
- `player-actions`: Add/define Player 1 permission rule for triggering counter reveal action.

## Impact

- Affected code: client gameplay header/board status rendering, server game state serialization, socket event handlers for reveal action.
- Affected tests: unit and E2E tests for counter values, hidden/revealed transitions, Player 1-only permissions, and reconnect behavior.
- APIs/dependencies: state payload and/or action events may include visibility flag updates; no new external dependencies expected.
