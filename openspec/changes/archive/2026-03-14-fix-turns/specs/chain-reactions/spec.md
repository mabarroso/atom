## MODIFIED Requirements

### Requirement: Cascade handling for chain reactions
The system SHALL resolve cascading explosions iteratively until no cells are at critical mass, and SHALL only mark cascade resolution complete when no pending explosions remain after the final explosion step.

#### Scenario: Single explosion causes no cascade
- **WHEN** a cell explodes and no adjacent cells reach critical mass
- **THEN** the cascade SHALL complete
- **AND** the game state SHALL be stable

#### Scenario: Multiple explosions cascade
- **WHEN** a cell explodes and causes adjacent cells to reach critical mass
- **THEN** the system SHALL trigger explosions for those cells
- **AND** continue resolving until all cells are below critical mass
- **AND** process explosions in a breadth-first or queue-based order

#### Scenario: Pending explosions are verified after each explosion step
- **WHEN** one explosion step is resolved
- **THEN** the system SHALL evaluate whether new critical-mass cells were created by that step
- **AND** keep cascade resolution in progress while any pending explosions remain
- **AND** only declare cascade completion after a verification pass finds no pending explosions

#### Scenario: Cascade depth is limited
- **WHEN** a cascade exceeds 100 explosions
- **THEN** the system SHALL force terminate the cascade
- **AND** log a warning about potential infinite loop
- **AND** stabilize the board to the current state

#### Scenario: Cascade resolution is deterministic
- **WHEN** the same board state triggers explosions
- **THEN** the system SHALL always produce the same cascade sequence
- **AND** ensure clients can reproduce animations reliably
