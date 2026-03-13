## Why

Configuration actions are currently scattered in gameplay controls, which makes discoverability and pacing adjustments less clear during a match. Grouping related options in a dedicated settings panel improves usability and keeps the main game controls cleaner.

## What Changes

- Add a settings button in the game UI that opens a configuration panel.
- Move the reveal counters action into that panel.
- Add an animation speed control in the panel with values from `0` to `24000 ms` in `100 ms` increments.
- Add a machine response time control in the panel with values from `0` to `5000 ms` in `100 ms` increments.
- Add a close button inside the panel to hide it.
- Keep existing game rules and turn logic unchanged; this change is UI/control organization and configuration-range behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `game-ui`: Introduce settings panel UX (open/close) and relocate/add configuration controls with defined ranges and increments.
- `chain-reactions`: Extend animation speed configuration range support to include `0..24000 ms` in `100 ms` steps.
- `machine-player`: Keep machine response configuration behavior but align control interaction and range usage through the settings panel (`0..5000 ms` in `100 ms` steps).

## Impact

- Affected code: game UI layout/interaction handlers, control wiring for timing updates, and range validation logic used by timing settings.
- Affected tests: unit and E2E tests for panel visibility toggle, control ranges/step behavior, and reveal counters action from within panel.
- APIs/dependencies: no new external dependencies expected; socket/state payload fields for timing remain in use.