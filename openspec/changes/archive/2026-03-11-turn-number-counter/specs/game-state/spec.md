## MODIFIED Requirements

### Requirement: Turn tracking
The system SHALL track which player's turn it is, enforce turn order, and maintain an authoritative turn number.

#### Scenario: Player 1 starts first
- **WHEN** a game transitions to ACTIVE state
- **THEN** the current player SHALL be Player 1
- **AND** only Player 1 SHALL be allowed to make moves

#### Scenario: Turn alternates after valid move
- **WHEN** a player makes a valid move
- **THEN** the current player SHALL switch to the other player
- **AND** only the new current player SHALL be allowed to make moves

#### Scenario: Turn does not change on invalid move
- **WHEN** a player attempts an invalid move
- **THEN** the current player SHALL remain unchanged
- **AND** the player SHALL be notified of the error

#### Scenario: Turn number initializes on game start
- **WHEN** a game transitions from SETUP to ACTIVE state
- **THEN** the system SHALL initialize `turnNumber` to the defined starting value
- **AND** the same convention SHALL be used consistently across all game modes

#### Scenario: Turn number increments on valid progression
- **WHEN** a valid move is applied and control advances to the next turn
- **THEN** the system SHALL increment `turnNumber` by exactly 1
- **AND** invalid or rejected moves SHALL NOT change `turnNumber`

### Requirement: Game state synchronization
The system SHALL provide complete game state for client synchronization, including authoritative turn-number progression.

#### Scenario: Full state includes all game data
- **WHEN** a client requests game state
- **THEN** the system SHALL include board state, current player, player info, lifecycle state, and move history
- **AND** format as JSON for Socket.io transmission

#### Scenario: State updates are broadcast on changes
- **WHEN** game state changes (move, turn, end)
- **THEN** the system SHALL broadcast updated state to all players in the game room
- **AND** include only changed data for efficiency

#### Scenario: Synchronized state includes turn number
- **WHEN** the server emits a game state snapshot
- **THEN** the payload SHALL include `turnNumber`
- **AND** the value SHALL represent the current authoritative progression point

#### Scenario: Reconnected clients receive current turn number
- **WHEN** a client reconnects and receives state resynchronization
- **THEN** the synchronized state SHALL include the latest `turnNumber`
- **AND** SHALL match the server's current turn progression
