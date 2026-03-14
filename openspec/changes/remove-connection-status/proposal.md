## Why

The connection status box and manual status request button add UI noise and do not support core gameplay decisions. Removing these controls simplifies the interface and keeps player attention on game setup, board interaction, and turn flow.

## What Changes

- Remove the "Estado de conexión" visual box from the client interface.
- Remove the "Solicitar estado" button from the client controls.
- Update client layout requirements so game controls and board placement no longer depend on a connection-status area.
- Keep gameplay flow, room management, and move synchronization behavior unchanged.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `client-structure`: Remove UI requirements that mandate displaying the connection status indicator and related placement constraints.

## Impact

- Affected code: client HTML layout and related UI wiring for status request control/state display.
- Affected specs: delta in `client-structure` only.
- APIs/dependencies: no new dependencies; no protocol changes required for gameplay events.
