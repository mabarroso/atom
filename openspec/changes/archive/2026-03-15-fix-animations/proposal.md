## Why

Explosion animations currently present inconsistent board state during cascades. Some cells are not fully redrawn after each explosion step, and ownership updates can lag when adjacent explosion transfers add atoms. This causes visual desynchronization between what players see and the authoritative game logic.

## What Changes

- Ensure the client redraws the full board state after every individual explosion step in a cascade sequence.
- Ensure cell ownership is updated immediately when a cell receives a new atom from an adjacent explosion transfer.
- Keep existing game rules, timing ranges, and socket event contracts unchanged.
- Keep synchronization behavior authoritative, with visual state reflecting the latest accepted server state at each animation step.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chain-reactions`: Clarify and enforce explosion-step state transitions so transferred atoms apply owner changes immediately for receiving cells.
- `game-ui`: Clarify and enforce per-step board redraw behavior so all cells reflect authoritative state after each explosion step.

## Impact

- Affected code: client animation queue / board render update path and server/client chain reaction state application logic where ownership is derived from transferred atoms.
- Affected tests: unit tests for chain-reaction ownership transfer and client animation-step redraw behavior; E2E tests validating visible ownership and board consistency during cascades.
- APIs/dependencies: no new dependencies and no socket payload schema changes expected.
