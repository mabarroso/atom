## Why

A player's move might not be clear to the other player. The waiting player currently has to remember the previous board state to identify what changed, which increases cognitive load and can cause confusion during turn transitions.

## What Changes

- Add visual highlighting for the exact cell where the latest move was made.
- Keep that highlight visible until the next move is made by the other player.
- Update turn-to-turn board feedback behavior so move visibility is explicit in both two-player and player-vs-machine flows.
- Preserve existing game rules and move validation behavior; this change only affects user feedback in the UI.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `game-ui`: Add requirements for persistent last-move cell highlighting between consecutive turns.

## Impact

- Affected code: client board rendering and visual state management for selected/updated cells.
- Affected tests: UI/unit tests and E2E flows that validate move feedback and turn progression.
- APIs/dependencies: no new external dependencies expected.
