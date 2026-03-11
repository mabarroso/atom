# Game State Specification

## Purpose
This capability covers authoritative Atom game lifecycle management: state machine transitions, turn control, player metadata and connectivity, move history, winner detection, and complete state synchronization for clients.
## Requirements
### Requirement: Game lifecycle state machine
The system SHALL manage game state as a finite state machine with states: SETUP, ACTIVE, ENDED.

#### Scenario: New game starts in SETUP state
- **WHEN** a new game is created
- **THEN** the game state SHALL be SETUP
- **AND** no moves SHALL be allowed in this state

#### Scenario: Game transitions to ACTIVE when started
- **WHEN** both players have joined and game is started
- **THEN** the game state SHALL transition to ACTIVE
- **AND** moves SHALL be allowed for the current player

#### Scenario: Game transitions to ENDED when won
- **WHEN** win condition is detected
- **THEN** the game state SHALL transition to ENDED
- **AND** no further moves SHALL be allowed
- **AND** the winner SHALL be recorded

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

### Requirement: Player management
The system SHALL manage player information including player numbers, colors, names, and connection status.

#### Scenario: Players are assigned numbers and colors
- **WHEN** players join a game
- **THEN** Player 1 SHALL be assigned blue color (#007bff)
- **AND** Player 2 SHALL be assigned orange color (#fd7e14)
- **AND** each player SHALL have a unique player number (1 or 2)

#### Scenario: Player names can be set
- **WHEN** a player joins or updates their name
- **THEN** the system SHALL store the player name
- **AND** default to "Jugador 1" / "Jugador 2" if not provided

#### Scenario: Player connection status is tracked
- **WHEN** a player connects or disconnects
- **THEN** the system SHALL update their connection status
- **AND** pause the game if a player disconnects
- **AND** end the game if a player is disconnected for more than 30 seconds

### Requirement: Move history tracking
The system SHALL maintain a history of all moves made during the game.

#### Scenario: Each move is recorded
- **WHEN** a player makes a valid move
- **THEN** the system SHALL append the move to the history
- **AND** include player number, row, column, and timestamp

#### Scenario: Move history is retrievable
- **WHEN** clients request game state
- **THEN** the system SHALL include the full move history
- **AND** preserve chronological order

### Requirement: Win condition detection
The system SHALL detect when a player has won the game: last player with atoms on the board wins.

#### Scenario: Player wins when opponent has no atoms
- **WHEN** after a move, only one player has atoms on the board
- **THEN** the system SHALL declare that player as the winner
- **AND** transition the game to ENDED state
- **AND** notify all clients of the winner

#### Scenario: Game continues if both players have atoms
- **WHEN** after a move, both players have atoms on the board
- **THEN** the game SHALL remain in ACTIVE state
- **AND** continue to the next turn

#### Scenario: Game detects forfeit on disconnect
- **WHEN** a player is disconnected for more than 30 seconds
- **THEN** the system SHALL declare the connected player as winner
- **AND** end the game with reason "forfeit"

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

### Requirement: Game mode tracking
The system SHALL track whether the game is Human vs Human or Human vs Machine mode.

#### Scenario: Game mode set at creation
- **WHEN** a game is created with mode parameter
- **THEN** the system SHALL store machineMode flag (true/false)
- **AND** default to false (Human vs Human) if not specified

#### Scenario: Machine mode prevents Player 2 join
- **WHEN** machineMode is true and a second client attempts to join
- **THEN** the system SHALL reject the join request
- **AND** emit error "error:game:roomFull"

#### Scenario: Machine mode in game state
- **WHEN** clients request game state
- **THEN** the system SHALL include machineMode flag
- **AND** indicate Player 2 type (human/machine)

### Requirement: Machine player metadata
The system SHALL track Player 2 as Machine instead of human when in Machine mode.

#### Scenario: Player 2 marked as Machine
- **WHEN** game is created with machineMode true
- **THEN** the system SHALL set player[2].isHuman to false
- **AND** set player[2].name to "Machine"
- **AND** assign orange color (#fd7e14) as normal

#### Scenario: Machine player connection status
- **WHEN** Machine is Player 2
- **THEN** the system SHALL mark Machine as always connected
- **AND** not trigger disconnect warnings for Machine

### Requirement: Automatic turn triggering for Machine
The system SHALL automatically trigger Machine moves without waiting for client events.

#### Scenario: Machine turn starts automatically
- **WHEN** turn switches to Player 2 and isHuman[2] is false
- **THEN** the system SHALL invoke Machine move selection
- **AND** apply the selected move after 2-second delay

#### Scenario: Machine turn completes normally
- **WHEN** Machine move is applied
- **THEN** the system SHALL resolve chain reactions
- **AND** switch turn back to Player 1
- **AND** broadcast state update to clients

#### Scenario: Machine respects game state
- **WHEN** game is not in ACTIVE state
- **THEN** the system SHALL not trigger automatic Machine move
- **AND** wait for proper game start

### Requirement: Game start with Machine
The system SHALL transition to ACTIVE state immediately when Machine mode is enabled.

#### Scenario: Single-player game starts without Player 2 join
- **WHEN** Player 1 starts game with machineMode true
- **THEN** the system SHALL transition to ACTIVE state
- **AND** not wait for second player connection
- **AND** begin with Player 1's turn

