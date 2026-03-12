## Why

Current gameplay and rendering do not support overflow atoms in a cell after explosions, which conflicts with the desired rule set where extra atoms are retained. Defining this now aligns reaction mechanics and UI visualization with the intended game behavior.

## What Changes

- Update chain-reaction behavior so exploding cells distribute one atom to each adjacent cell and retain overflow atoms instead of resetting to zero.
- Define overflow handling for all cell types (corner, edge, center) based on adjacent-cell count, keeping `remaining = atoms - adjacentCount` after each explosion.
- Keep ownership semantics consistent: distributed atoms convert receiving cells to the exploding player.
- Update cell visualization for counts greater than 4 to display a compact 3-atom layout plus the total atom count in the cell.
- Preserve existing behavior for counts from 0 to 4 and for reaction ordering/cascade processing.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chain-reactions`: Change explosion resolution from full cell reset to overflow-preserving redistribution, while keeping one-atom-per-adjacent-cell distribution and deterministic cascade behavior.
- `game-ui`: Define rendering for cells with more than 4 atoms as a 3-atom visual representation plus numeric total.

## Impact

- Affected code: server chain-reaction resolution logic, overflow state propagation during cascades, and client cell-rendering logic for atom counts above 4.
- Affected tests: unit tests for reaction resolution with overflow and cascade stability; UI/unit/E2E tests for >4 atom rendering and count visibility.
- APIs/dependencies: no new external dependencies expected; synchronized state payloads continue carrying numeric atom counts.