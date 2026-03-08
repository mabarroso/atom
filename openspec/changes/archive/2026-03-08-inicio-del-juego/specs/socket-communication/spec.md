# Socket Communication Specification (Delta)

## ADDED Requirements

### Requirement: Game-specific event handling
The system SHALL handle game-specific Socket.io events following the existing naming convention with "client:game:" and "server:game:" prefixes.

#### Scenario: Client sends game start event
- **WHEN** a client requests to start a game
- **THEN** the event SHALL be named "client:game:start"
- **AND** include game configuration (board size, players)

#### Scenario: Server broadcasts game start confirmation
- **WHEN** a game is successfully started
- **THEN** the server SHALL emit "server:game:started"
- **AND** broadcast to all players in the game room
- **AND** include initial game state

### Requirement: Game move synchronization
The system SHALL synchronize player moves across all clients in a game room.

#### Scenario: Client sends move event
- **WHEN** a player makes a move
- **THEN** the event SHALL be named "client:game:move"
- **AND** include move data: `{ row, col }`

#### Scenario: Server validates and broadcasts move
- **WHEN** server receives a move event
- **THEN** the server SHALL validate the move
- **AND** emit "server:game:stateUpdate" to all players in the room
- **AND** include updated game state and any chain reaction animations

#### Scenario: Server rejects invalid move
- **WHEN** server receives an invalid move
- **THEN** the server SHALL emit "error:game:invalidMove" to the originating client
- **AND** include error reason in Spanish

### Requirement: Game state update broadcasting
The system SHALL broadcast game state updates to all players in a game room when state changes.

#### Scenario: State update after valid move
- **WHEN** a valid move is applied
- **THEN** the server SHALL emit "server:game:stateUpdate"
- **AND** include complete state: board, current player, turn number, explosion sequence

#### Scenario: State update on turn change
- **WHEN** the current player changes
- **THEN** the server SHALL emit "server:game:turnChanged"
- **AND** include new current player

### Requirement: Game end event handling
The system SHALL notify all players when a game ends with win condition information.

#### Scenario: Server broadcasts game end
- **WHEN** win condition is detected
- **THEN** the server SHALL emit "server:game:ended"
- **AND** include winner, reason (win/forfeit), final state

#### Scenario: Client receives game end notification
- **WHEN** "server:game:ended" is received
- **THEN** the client SHALL display win/lose message
- **AND** transition to ENDED state in UI

### Requirement: Game room management
The system SHALL use Socket.io rooms to isolate game communication between players.

#### Scenario: Players join game room on start
- **WHEN** a game is created
- **THEN** the server SHALL create a unique room ID
- **AND** both players SHALL join that room via `socket.join(roomId)`

#### Scenario: Events broadcast only to room members
- **WHEN** server emits game events
- **THEN** events SHALL be sent only to sockets in the game room
- **AND** use `io.to(roomId).emit(eventName, data)`

#### Scenario: Room is cleaned up on game end
- **WHEN** a game ends or all players disconnect
- **THEN** the server SHALL remove the room
- **AND** clean up associated game state from memory

### Requirement: Game error handling
The system SHALL emit specific error events for game-related failures following the "error:game:" prefix convention.

#### Scenario: Invalid move error
- **WHEN** a move validation fails
- **THEN** the server SHALL emit "error:game:invalidMove"
- **AND** include Spanish error message and move details

#### Scenario: Not player's turn error
- **WHEN** a player attempts a move out of turn
- **THEN** the server SHALL emit "error:game:notYourTurn"
- **AND** include Spanish error message

#### Scenario: Game not active error
- **WHEN** a move is attempted in SETUP or ENDED state
- **THEN** the server SHALL emit "error:game:notActive"
- **AND** include current game state

### Requirement: Multi-client E2E traceability
The system SHALL document temporary cross-browser E2E limitations for multi-client synchronization scenarios.

#### Scenario: Known flaky scenarios are tracked
- **WHEN** E2E tests for multi-client cascade and win-condition synchronization are unstable across browsers
- **THEN** those scenarios SHALL remain explicitly marked as pending in the task list
- **AND** the project documentation SHALL reference them as known limitations until a deterministic harness is implemented
