## MODIFIED Requirements

### Requirement: Player turn indicator
The system SHALL display which player's turn it is with clear visual indication and include the current turn number.

#### Scenario: Current player is highlighted
- **WHEN** it is a player's turn
- **THEN** the UI SHALL highlight that player's indicator
- **AND** use color, border, or icon to show active player

#### Scenario: Turn indicator updates immediately
- **WHEN** the turn changes
- **THEN** the UI SHALL update the indicator within 100ms
- **AND** use smooth transition or animation

#### Scenario: Turn indicator is announced to screen readers
- **WHEN** the turn changes
- **THEN** an ARIA live region SHALL announce "Turno de Jugador N"
- **AND** use `aria-live="polite"`

#### Scenario: Turn number is visible during active gameplay
- **WHEN** the game is in ACTIVE state
- **THEN** the UI SHALL display the current turn number in the gameplay status area
- **AND** the displayed number SHALL match the authoritative game-state turn number

#### Scenario: Turn number updates after each valid turn progression
- **WHEN** a valid move is applied and turn control advances
- **THEN** the UI SHALL update the turn number in the same state refresh cycle
- **AND** the update SHALL be visible in both player-vs-player and player-vs-machine modes

#### Scenario: Reconnection restores current turn number
- **WHEN** a client reconnects and receives synchronized game state
- **THEN** the UI SHALL render the current turn number from the latest state snapshot
- **AND** SHALL NOT reset to an initial value unless a new game starts
