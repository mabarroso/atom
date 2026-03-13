## MODIFIED Requirements

### Requirement: Thinking delay
The system SHALL use configurable machine response delay before executing Machine move, including `0 ms`, to support match pacing controls and synchronized configuration updates.

#### Scenario: Machine player responds automatically
- **WHEN** it is the machine player's turn
- **THEN** the machine SHALL select a valid move
- **AND** execute the move after the configured machine response delay

#### Scenario: Machine response delay is configurable
- **WHEN** a user updates match timing settings
- **THEN** the system SHALL apply the configured machine response delay for future machine turns
- **AND** SHALL preserve current turn resolution correctness

#### Scenario: Machine response supports zero delay
- **WHEN** configured machine response delay is `0 ms`
- **THEN** the machine move SHALL be executed immediately after turn-transition processing completes

#### Scenario: Machine response delay supports grouped-control range and step
- **WHEN** machine response timing settings are validated or applied
- **THEN** the system SHALL accept values from `0` to `5000 ms`
- **AND** SHALL enforce `100 ms` increments

#### Scenario: Timing settings remain synchronized for all clients
- **WHEN** any connected client updates machine response timing
- **THEN** the authoritative value SHALL be broadcast to all connected clients
- **AND** reconnecting clients SHALL receive the latest configured value in initial state synchronization
