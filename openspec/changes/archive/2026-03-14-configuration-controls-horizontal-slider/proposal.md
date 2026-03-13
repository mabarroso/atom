## Why

Current timing configuration controls (`Velocidad animación` and `Respuesta máquina`) are presented as numeric inputs, which makes quick pacing adjustments less intuitive during gameplay. Replacing them with horizontal sliders improves usability on desktop and touch devices while preserving existing authoritative timing behavior.

## What Changes

- Replace the `Velocidad animación` numeric control with a horizontal slider control in the settings panel.
- Replace the `Respuesta máquina` numeric control with a horizontal slider control in the settings panel.
- Keep the same validated ranges and increments:
  - Animation speed: `0..24000 ms`, step `100`.
  - Machine response: `0..5000 ms`, step `100`.
- Keep state synchronization behavior unchanged so updates remain authoritative and propagate to all connected clients.
- Keep existing labels in Spanish and preserve accessibility requirements (keyboard interaction and descriptive `aria-label` attributes).

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `game-ui`: Change timing control input type/interaction model to horizontal slider controls while preserving existing labels, ranges, and synchronized update behavior.
- `machine-player`: No logic change; machine response timing continues to consume authoritative value supplied by configuration controls.
- `chain-reactions`: No logic change; animation pacing continues to consume authoritative value supplied by configuration controls.

## Impact

- Affected code: settings panel markup/styles for timing controls and UI event handling in client game UI.
- Affected tests: unit + E2E tests covering timing controls (input interaction path now via sliders), range boundaries, step enforcement, and synchronized updates.
- APIs/dependencies: no new dependencies expected; existing timing payload fields/events remain in use.

## Assumptions

- “Back to Top horizontal slider” is interpreted as replacing both controls with standard horizontal range sliders (one per control), not a combined dual-handle slider.
