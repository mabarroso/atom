## MODIFIED Requirements

### Requirement: Move validation
The system SHALL validate all player actions before applying them to game state, including permission-gated non-move actions, and SHALL reject new move attempts while a prior move's cascade resolution is still in progress.

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

#### Scenario: Move is rejected while explosions from prior move are pending
- **WHEN** a player attempts a move while cascade resolution from a previous accepted move is still in progress
- **THEN** the system SHALL reject the move
- **AND** keep board, ownership, and turn state unchanged
- **AND** emit a turn/state-related validation error

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

### Requirement: Move application with state updates
The system SHALL update game state after successful move application and SHALL NOT hand off turn control until cascade resolution has completed with no pending explosions.

#### Scenario: Turn switches after successful move
- **WHEN** a move is successfully applied and chain reactions are fully resolved with no pending explosions
- **THEN** the system SHALL switch current player to the opponent
- **AND** broadcast state update to all clients

#### Scenario: Win condition checked after move
- **WHEN** a move is applied and chain reactions are resolved
- **THEN** the system SHALL check win condition
- **AND** end game if only one player has atoms remaining

#### Scenario: Move recorded in history
- **WHEN** a move is successfully applied
- **THEN** the system SHALL append move to game history
- **AND** include timestamp, player, row, column
