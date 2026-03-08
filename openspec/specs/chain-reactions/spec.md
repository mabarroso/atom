# Chain Reactions Specification

## Purpose
This capability covers Atom chain-reaction mechanics: explosion detection at critical mass, deterministic cascade resolution, atom redistribution to adjacent cells, and generation of ordered animation events for clients.

## Requirements
### Requirement: Explosion detection
The system SHALL detect when a cell reaches critical mass and trigger an explosion.

#### Scenario: Corner cell explodes at 2 atoms
- **WHEN** a corner cell reaches 2 atoms
- **THEN** the system SHALL trigger an explosion
- **AND** mark the cell for atom distribution

#### Scenario: Edge cell explodes at 3 atoms
- **WHEN** an edge cell reaches 3 atoms
- **THEN** the system SHALL trigger an explosion
- **AND** mark the cell for atom distribution

#### Scenario: Center cell explodes at 4 atoms
- **WHEN** a center cell reaches 4 atoms
- **THEN** the system SHALL trigger an explosion
- **AND** mark the cell for atom distribution

#### Scenario: Cell below critical mass does not explode
- **WHEN** a cell has atoms below its critical mass
- **THEN** the system SHALL NOT trigger an explosion
- **AND** leave the cell unchanged

### Requirement: Atom distribution to adjacent cells
The system SHALL distribute atoms from exploding cells to all adjacent cells.

#### Scenario: Explosion distributes one atom per neighbor
- **WHEN** a cell explodes
- **THEN** the system SHALL place one atom on each adjacent cell
- **AND** set all receiving cells' owner to the exploding player
- **AND** reset the exploding cell to zero atoms

#### Scenario: Adjacent cells receive atoms correctly
- **WHEN** atoms are distributed from explosion
- **THEN** each adjacent cell SHALL increment its atom count by 1
- **AND** change owner to the exploding player
- **AND** check if the receiving cell now reaches critical mass

### Requirement: Cascade handling for chain reactions
The system SHALL resolve cascading explosions iteratively until no cells are at critical mass.

#### Scenario: Single explosion causes no cascade
- **WHEN** a cell explodes and no adjacent cells reach critical mass
- **THEN** the cascade SHALL complete
- **AND** the game state SHALL be stable

#### Scenario: Multiple explosions cascade
- **WHEN** a cell explodes and causes adjacent cells to reach critical mass
- **THEN** the system SHALL trigger explosions for those cells
- **AND** continue resolving until all cells are below critical mass
- **AND** process explosions in a breadth-first or queue-based order

#### Scenario: Cascade depth is limited
- **WHEN** a cascade exceeds 100 explosions
- **THEN** the system SHALL force terminate the cascade
- **AND** log a warning about potential infinite loop
- **AND** stabilize the board to the current state

#### Scenario: Cascade resolution is deterministic
- **WHEN** the same board state triggers explosions
- **THEN** the system SHALL always produce the same cascade sequence
- **AND** ensure clients can reproduce animations reliably

### Requirement: Animation coordination
The system SHALL generate an ordered sequence of explosion events for client animation.

#### Scenario: Explosion sequence is generated
- **WHEN** explosions are resolved on the server
- **THEN** the system SHALL create an ordered array of explosion events
- **AND** each event SHALL include `{ row, col, atoms, player, timestamp }`

#### Scenario: Explosion sequence is sent to clients
- **WHEN** chain reaction completes
- **THEN** the system SHALL send the explosion sequence to all clients
- **AND** clients SHALL animate each explosion sequentially

#### Scenario: Animation timing is configurable
- **WHEN** explosion sequence is sent
- **THEN** the system SHALL include suggested delay between animations (e.g., 300ms)
- **AND** clients MAY adjust timing based on user preference or performance

### Requirement: Chain reaction performance
The system SHALL resolve chain reactions efficiently even for complex cascades.

#### Scenario: Large cascade completes quickly
- **WHEN** a cascade involves 50 explosions
- **THEN** the system SHALL resolve within 100 milliseconds
- **AND** not block other game operations

#### Scenario: Memory is managed during cascades
- **WHEN** resolving cascades
- **THEN** the system SHALL use iterative algorithms (no recursion)
- **AND** reuse data structures to minimize allocations
- **AND** prevent memory leaks

