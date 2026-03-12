## MODIFIED Requirements

### Requirement: Game controls
The system SHALL provide controls for starting, restarting, managing games, revealing atom counters according to player permissions, and modifying match timing settings.

#### Scenario: New game button is available
- **WHEN** in SETUP or ENDED state
- **THEN** a "Nueva Partida" button SHALL be visible
- **AND** clicking it SHALL start a new game

#### Scenario: Restart button is available during game
- **WHEN** in ACTIVE state
- **THEN** a "Reiniciar" button SHALL be visible
- **AND** clicking it SHALL prompt for confirmation
- **AND** reset the game on confirmation

#### Scenario: Controls are accessible
- **WHEN** controls are rendered
- **THEN** all buttons and timing inputs SHALL have descriptive `aria-label` attributes
- **AND** be keyboard accessible
- **AND** meet minimum 44x44px touch target size for interactive controls

#### Scenario: Atom counters are hidden by default
- **WHEN** a game starts or restarts
- **THEN** the atom counter panel SHALL be hidden
- **AND** no atom totals SHALL be visible to either player

#### Scenario: Player 1 can reveal atom counters for everyone
- **WHEN** Player 1 activates the reveal counters control during an active game
- **THEN** the UI SHALL display Player 1 atom count, Player 2 atom count, and total atoms
- **AND** counters SHALL become visible to all connected players in the same match

#### Scenario: Player 2 cannot reveal atom counters
- **WHEN** Player 2 attempts to activate the reveal counters control
- **THEN** the UI SHALL not reveal counters from that action
- **AND** visibility SHALL remain controlled only by authoritative server state

#### Scenario: Reconnection preserves counter visibility state
- **WHEN** a client reconnects and receives synchronized state
- **THEN** the UI SHALL render counters visible or hidden according to authoritative visibility state
- **AND** rendered values SHALL match authoritative counts from synchronized state

#### Scenario: Timing controls are visible during active gameplay
- **WHEN** timing settings are available for the current match
- **THEN** the UI SHALL show one control for animation speed and one control for machine response time
- **AND** each control SHALL display the current authoritative value

#### Scenario: Timing control updates are synchronized
- **WHEN** a timing control value is changed and accepted by authoritative game state
- **THEN** the UI SHALL update displayed timing values for all connected clients in the same match
- **AND** subsequent gameplay pacing SHALL use the updated values

#### Scenario: Machine response time accepts zero milliseconds
- **WHEN** machine response time is set to `0`
- **THEN** the UI SHALL accept and display `0 ms` as a valid value
- **AND** machine turns SHALL remain functional without introducing extra artificial delay

#### Scenario: Reconnection restores timing control values
- **WHEN** a client reconnects and receives synchronized state
- **THEN** the UI SHALL render animation speed and machine response values from authoritative state
- **AND** SHALL NOT reset to defaults unless a new game or reset applies default timing policy
