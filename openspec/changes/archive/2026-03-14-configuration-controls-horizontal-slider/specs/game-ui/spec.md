## MODIFIED Requirements

### Requirement: Game controls
The system SHALL provide controls for starting, restarting, managing games, revealing atom counters according to player permissions, and modifying match timing settings through a dedicated settings panel.

#### Scenario: Timing controls are horizontal sliders inside settings panel during active gameplay
- **WHEN** timing settings are available for the current match and settings panel is open
- **THEN** the UI SHALL show one horizontal slider for animation speed and one horizontal slider for machine response time inside the panel
- **AND** labels SHALL remain in Spanish as "Velocidad animación (ms)" and "Respuesta máquina (ms)"
- **AND** each slider SHALL display the current authoritative value

#### Scenario: Animation speed slider supports full configured range
- **WHEN** animation speed is edited from settings panel
- **THEN** the UI SHALL allow values from `0` to `24000 ms`
- **AND** SHALL enforce `100 ms` increments

#### Scenario: Machine response slider supports full configured range
- **WHEN** machine response time is edited from settings panel
- **THEN** the UI SHALL allow values from `0` to `5000 ms`
- **AND** SHALL enforce `100 ms` increments

#### Scenario: Timing sliders are keyboard and pointer accessible
- **WHEN** timing sliders are rendered
- **THEN** each slider SHALL expose descriptive `aria-label` attributes
- **AND** each slider SHALL be operable via keyboard and pointer interactions

#### Scenario: Timing slider updates are synchronized
- **WHEN** a timing slider value is changed and accepted by authoritative game state
- **THEN** the UI SHALL update displayed timing values for all connected clients in the same match
- **AND** subsequent gameplay pacing SHALL use the updated values

#### Scenario: Reconnection restores timing slider values
- **WHEN** a client reconnects and receives synchronized state
- **THEN** the UI SHALL render animation speed and machine response slider values from authoritative state
- **AND** SHALL NOT reset to defaults unless a new game or reset applies default timing policy
