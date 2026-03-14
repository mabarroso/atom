## Why

In some machine-turn flows, the board cell affected by the machine move is not visibly refreshed at the expected moment. This causes confusing UI feedback because players cannot reliably see the machine move outcome immediately.

## What Changes

- Ensure the board redraws the affected cell immediately after a machine move is applied.
- Ensure redraw behavior is driven by authoritative state so the rendered cell owner/atoms match server state.
- Keep existing game rules, machine decision logic, and socket event names/payloads unchanged.
- Add/update tests for machine-move visual refresh behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `game-ui`: Update machine-move rendering behavior so the impacted board cell is redrawn immediately after machine move state application.

## Impact

- Affected code: client game UI machine-move event handling and board render trigger path.
- Affected tests: unit/E2E tests that validate machine move visibility and cell state refresh.
- APIs/dependencies: no new dependencies and no protocol changes expected.
