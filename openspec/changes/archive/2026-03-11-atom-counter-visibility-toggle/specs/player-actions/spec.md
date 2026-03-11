## MODIFIED Requirements

### Requirement: Move validation
The system SHALL validate all player actions before applying them to game state, including permission-gated non-move actions.

#### Scenario: Valid move on empty cell
- **WHEN** a player clicks an empty cell (atoms=0) on their turn
- **THEN** the system SHALL accept the move
- **AND** place an atom on that cell
- **AND** assign cell ownership to the player

#### Scenario: Valid move on owned cell
- **WHEN** a player clicks their own cell (atoms > 0) on their turn
- **THEN** the system SHALL accept the move
- **AND** increment the atom count on that cell

#### Scenario: Invalid move on opponent's cell
- **WHEN** a player clicks an opponent's cell on their turn
- **THEN** the system SHALL reject the move
- **AND** emit error event "error:game:invalidMove"
- **AND** keep the board state unchanged

#### Scenario: Invalid move when not player's turn
- **WHEN** a player attempts a move when it's not their turn
- **THEN** the system SHALL reject the move
- **AND** emit error event "error:game:notYourTurn"

#### Scenario: Invalid move in non-ACTIVE state
- **WHEN** a player attempts a move in SETUP or ENDED state
- **THEN** the system SHALL reject the move
- **AND** emit error event "error:game:notActive"

#### Scenario: Invalid move out of bounds
- **WHEN** a player attempts a move with invalid row/column coordinates
- **THEN** the system SHALL reject the move
- **AND** emit error event "error:game:invalidCell"

#### Scenario: Player 1 can reveal atom counters
- **WHEN** Player 1 triggers the reveal atom counters action in ACTIVE state
- **THEN** the system SHALL accept the action
- **AND** set `atomCountersVisible` to true
- **AND** broadcast updated authoritative state to all players

#### Scenario: Player 2 cannot reveal atom counters
- **WHEN** Player 2 triggers the reveal atom counters action
- **THEN** the system SHALL reject the action
- **AND** keep `atomCountersVisible` unchanged
- **AND** emit a permission-related error event

#### Scenario: Reveal action is idempotent
- **WHEN** Player 1 triggers reveal action while `atomCountersVisible` is already true
- **THEN** the system SHALL keep `atomCountersVisible` as true
- **AND** SHALL NOT alter gameplay state beyond synchronized visibility confirmation
