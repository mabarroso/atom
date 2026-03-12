## MODIFIED Requirements

### Requirement: Thinking delay
The system SHALL use configurable machine response delay before executing Machine move, including `0 ms`, to support match pacing controls.

#### Scenario: Delay before move broadcast uses configured value
- **WHEN** Machine selects a move
- **THEN** the system SHALL wait the configured machine response delay before applying move
- **AND** not display visible "thinking" message to client

#### Scenario: Zero-delay machine response is supported
- **WHEN** configured machine response delay is `0 ms`
- **THEN** the system SHALL execute the Machine move without additional artificial wait
- **AND** preserve the same move-validation and turn-progression rules

#### Scenario: Delay does not block server
- **WHEN** machine response delay is active
- **THEN** the system SHALL use non-blocking scheduling
- **AND** allow other game operations to continue

#### Scenario: Updated delay applies to subsequent machine turns
- **WHEN** machine response delay is changed during an active match
- **THEN** already scheduled moves MAY keep their original delay
- **AND** future machine turns SHALL use the updated delay value
