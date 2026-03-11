# Player Actions Specification

## Purpose
This capability covers player interaction rules in Atom: move validation, atom placement behavior, integration with chain reactions, game-state updates after valid moves, and client optimistic-update reconciliation.
## Requirements
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

### Requirement: Atom placement logic
The system SHALL apply valid moves by updating cell state and triggering chain reactions if necessary.

#### Scenario: Atom placed on empty cell
- **WHEN** a valid move targets an empty cell
- **THEN** the system SHALL set cell atoms to 1
- **AND** set cell owner to the current player
- **AND** check if critical mass is reached

#### Scenario: Atom added to owned cell
- **WHEN** a valid move targets a player's own cell with N atoms
- **THEN** the system SHALL increment atoms to N+1
- **AND** check if critical mass is reached

#### Scenario: Critical mass triggers explosion
- **WHEN** atom count reaches critical mass after placement
- **THEN** the system SHALL trigger an explosion
- **AND** distribute atoms to adjacent cells
- **AND** continue resolving chain reactions

### Requirement: Move application with state updates
The system SHALL update game state after successful move application.

#### Scenario: Turn switches after successful move
- **WHEN** a move is successfully applied and chain reactions resolved
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

### Requirement: Optimistic client updates
The system SHALL support optimistic UI updates on the client with server confirmation.

#### Scenario: Client predicts successful move
- **WHEN** a player makes a move on the client
- **THEN** the client SHALL immediately show the move visually
- **AND** send move request to server for validation

#### Scenario: Client reverts on rejection
- **WHEN** the server rejects a move
- **THEN** the client SHALL revert the optimistic change
- **AND** display error message in Spanish

#### Scenario: Client confirms on acceptance
- **WHEN** the server accepts a move
- **THEN** the client SHALL replace optimistic state with authoritative server state
- **AND** show any chain reaction animations

### Requirement: Machine move validation
The system SHALL validate Machine-generated moves using the same rules as human player moves.

#### Scenario: Machine move validated identically
- **WHEN** Machine selects a cell to play
- **THEN** the system SHALL apply standard move validation
- **AND** reject invalid Machine moves with same error handling

#### Scenario: Machine obeys turn order
- **WHEN** Machine is Player 2
- **THEN** the system SHALL only accept Machine moves during Player 2's turn
- **AND** reject moves if not Machine's turn

### Requirement: Machine move application
The system SHALL apply Machine moves using existing atom placement and chain reaction logic without modification.

#### Scenario: Machine move triggers chain reactions
- **WHEN** Machine places atom causing critical mass
- **THEN** the system SHALL resolve explosions identically to human moves
- **AND** apply same adjacency distribution rules

#### Scenario: Machine move updates game state
- **WHEN** Machine completes a valid move
- **THEN** the system SHALL update board state
- **AND** switch turn to Player 1
- **AND** check win conditions

