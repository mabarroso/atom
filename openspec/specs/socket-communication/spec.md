# Socket Communication Specification

## Purpose

This capability covers the Socket.io integration for real-time bidirectional communication between clients and server. It defines connection handling, event naming conventions, broadcasting mechanisms, automatic reconnection behavior, and error management for WebSocket-based communication.

## Requirements
### Requirement: Socket.io server integration
The system SHALL integrate Socket.io with the Express server to enable real-time bidirectional communication between clients and server.

#### Scenario: Socket.io server is initialized
- **WHEN** the Express server starts
- **THEN** Socket.io SHALL be attached to the HTTP server instance
- **AND** be ready to accept WebSocket connections

### Requirement: Client connection handling
The system SHALL accept and track client Socket.io connections, assigning unique socket IDs to each client.

#### Scenario: Client connects successfully
- **WHEN** a client establishes a Socket.io connection
- **THEN** the server SHALL emit a "connection" event
- **AND** assign a unique socket ID to that client
- **AND** log the connection with the socket ID

#### Scenario: Client disconnects
- **WHEN** a connected client disconnects
- **THEN** the server SHALL emit a "disconnect" event for that socket
- **AND** log the disconnection
- **AND** clean up any session-related data for that socket

### Requirement: Event naming convention
The system SHALL follow a consistent event naming convention: client-to-server events prefixed with "client:", server-to-client events prefixed with "server:", and errors prefixed with "error:".

#### Scenario: Client event follows naming convention
- **WHEN** the server defines handlers for client events
- **THEN** all client event names SHALL start with "client:" prefix
- **AND** all server-emitted events SHALL start with "server:" prefix
- **AND** all error events SHALL start with "error:" prefix

### Requirement: Connection status broadcast
The system SHALL provide a mechanism to broadcast connection status updates to all connected clients.

#### Scenario: Server broadcasts to all clients
- **WHEN** the server needs to notify all clients of a status change
- **THEN** the server SHALL use Socket.io's broadcast functionality
- **AND** emit the event to all connected sockets

### Requirement: Automatic reconnection support
The system SHALL configure Socket.io to support automatic reconnection with exponential backoff when connections are lost.

#### Scenario: Client reconnects after disconnect
- **WHEN** a client loses connection temporarily
- **THEN** Socket.io SHALL automatically attempt to reconnect
- **AND** use exponential backoff between retry attempts
- **AND** restore the connection when the server is available

### Requirement: Error handling for socket events
The system SHALL implement error handlers for socket events to prevent unhandled errors from crashing the server.

#### Scenario: Socket event handler throws error
- **WHEN** an error occurs within a socket event handler
- **THEN** the error SHALL be caught and logged
- **AND** an "error:" prefixed event SHALL be emitted to the client
- **AND** the server SHALL continue running

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

### Requirement: Machine move broadcast event
The system SHALL broadcast Machine-selected moves to clients using a dedicated event.

#### Scenario: Server emits Machine move event
- **WHEN** Machine selects a cell to play
- **THEN** the server SHALL emit "server:game:machineMove" event
- **AND** broadcast to all clients in the game room
- **AND** include cell coordinates: `{ row, col, atoms }`

#### Scenario: Machine move precedes state update
- **WHEN** Machine move is broadcast
- **THEN** the event SHALL be emitted before "server:game:stateUpdate"
- **AND** allow client to highlight/animate selected cell
- **AND** provide visual feedback of AI decision

### Requirement: Client receives Machine move
The system SHALL allow clients to subscribe to Machine move events for visualization.

#### Scenario: Client handles Machine move event
- **WHEN** client receives "server:game:machineMove"
- **THEN** the client SHALL highlight the selected cell
- **AND** display brief visual indication (animation, flash, etc.)
- **AND** await subsequent state update

### Requirement: Game mode indicator in connection
The system SHALL include game mode information in initial game state broadcasts.

#### Scenario: Client receives machineMode flag
- **WHEN** client receives "server:game:started" or "server:statusUpdate"
- **THEN** the response SHALL include machineMode boolean
- **AND** indicate Player 2 type (human: true/false)
- **AND** allow client UI to adjust messaging accordingly

