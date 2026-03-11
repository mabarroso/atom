## MODIFIED Requirements

### Requirement: Game state synchronization
The system SHALL provide complete game state for client synchronization, including authoritative turn-number progression and atom-counter visibility state.

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

#### Scenario: Synchronized state includes atom counter visibility flag
- **WHEN** the server emits a game state snapshot
- **THEN** the payload SHALL include `atomCountersVisible`
- **AND** the value SHALL represent the authoritative reveal state shared by all players

#### Scenario: Synchronized state includes authoritative atom counter values
- **WHEN** the server emits a game state snapshot
- **THEN** the payload SHALL include Player 1 atom count, Player 2 atom count, and total atom count
- **AND** values SHALL be derived from the authoritative board state after all resolved reactions

#### Scenario: New game resets atom counter visibility
- **WHEN** a new game starts or current game is restarted
- **THEN** `atomCountersVisible` SHALL reset to false
- **AND** clients SHALL receive hidden counter state in synchronized updates
