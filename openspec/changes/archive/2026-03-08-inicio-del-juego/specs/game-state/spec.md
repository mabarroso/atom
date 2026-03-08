# Game State Specification

## ADDED Requirements

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
The system SHALL track which player's turn it is and enforce turn order.

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
The system SHALL provide complete game state for client synchronization.

#### Scenario: Full state includes all game data
- **WHEN** a client requests game state
- **THEN** the system SHALL include board state, current player, player info, lifecycle state, and move history
- **AND** format as JSON for Socket.io transmission

#### Scenario: State updates are broadcast on changes
- **WHEN** game state changes (move, turn, end)
- **THEN** the system SHALL broadcast updated state to all players in the game room
- **AND** include only changed data for efficiency
