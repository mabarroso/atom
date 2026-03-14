## MODIFIED Requirements

### Requirement: Turn tracking
The system SHALL track which player's turn it is, enforce turn order, maintain an authoritative round number, and defer turn handoff until all explosions from the active move are fully resolved.

#### Scenario: Player 1 starts first
- **WHEN** a game transitions to ACTIVE state
- **THEN** the current player SHALL be Player 1
- **AND** only Player 1 SHALL be allowed to make moves

#### Scenario: Turn alternates after valid move
- **WHEN** a player makes a valid move
- **THEN** the current player SHALL switch to the other player only after cascade resolution completes with no pending explosions
- **AND** only the new current player SHALL be allowed to make moves

#### Scenario: Turn remains locked while explosions are pending
- **WHEN** a move has been accepted and cascade resolution is still processing pending explosions
- **THEN** the current player SHALL NOT change during that pending-explosion window
- **AND** turn handoff SHALL occur only after pending explosions are exhausted

#### Scenario: Turn does not change on invalid move
- **WHEN** a player attempts an invalid move
- **THEN** the current player SHALL remain unchanged
- **AND** the player SHALL be notified of the error

#### Scenario: Round number initializes on game start
- **WHEN** a game transitions from SETUP to ACTIVE state
- **THEN** the system SHALL initialize `roundNumber` to 1
- **AND** the same convention SHALL be used consistently across all game modes

#### Scenario: Round number increments after Player 2 completes a valid turn
- **WHEN** a valid move by Player 2 is applied, all resulting explosions are resolved, and turn control returns to Player 1
- **THEN** the system SHALL increment `roundNumber` by exactly 1
- **AND** a valid move by Player 1 SHALL NOT increment `roundNumber`

#### Scenario: Invalid or rejected moves do not change round number
- **WHEN** a move attempt is invalid or rejected
- **THEN** `roundNumber` SHALL remain unchanged

### Requirement: Automatic turn triggering for Machine
The system SHALL automatically trigger Machine moves without waiting for client events, and SHALL only trigger the machine turn after the previous move's cascade resolution has fully completed.

#### Scenario: Machine turn starts automatically
- **WHEN** turn switches to Player 2 and isHuman[2] is false
- **THEN** the system SHALL invoke Machine move selection
- **AND** apply the selected move after configured machine delay

#### Scenario: Machine turn waits for explosion completion from prior move
- **WHEN** a valid move transitions control toward Player 2 but pending explosions from that move are still unresolved
- **THEN** the system SHALL defer Machine move execution until no pending explosions remain
- **AND** SHALL NOT emit machine move action before cascade completion

#### Scenario: Machine turn completes normally
- **WHEN** Machine move is applied
- **THEN** the system SHALL resolve chain reactions
- **AND** switch turn back to Player 1
- **AND** broadcast state update to clients

#### Scenario: Machine respects game state
- **WHEN** game is not in ACTIVE state
- **THEN** the system SHALL not trigger automatic Machine move
- **AND** wait for proper game start
