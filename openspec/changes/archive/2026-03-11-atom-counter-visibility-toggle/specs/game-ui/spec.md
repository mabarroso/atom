## MODIFIED Requirements

### Requirement: Game controls
The system SHALL provide controls for starting, restarting, managing games, and revealing atom counters according to player permissions.

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
- **THEN** all buttons SHALL have descriptive `aria-label` attributes
- **AND** be keyboard accessible
- **AND** meet minimum 44x44px touch target size

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
