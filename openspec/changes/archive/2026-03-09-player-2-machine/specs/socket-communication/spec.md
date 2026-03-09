# Socket Communication Specification (Delta)

## Purpose
Adds Machine move broadcasting to clients so human players can see AI opponent's selected cells and maintain engagement.

## ADDED Requirements

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
