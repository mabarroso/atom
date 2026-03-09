# Game State Specification (Delta)

## Purpose
Adds Machine player tracking and automatic turn triggering to support single-player mode with AI opponent.

## ADDED Requirements

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
