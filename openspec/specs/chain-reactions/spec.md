# Chain Reactions Specification

## Purpose
This capability covers Atom chain-reaction mechanics: explosion detection at critical mass, deterministic cascade resolution, atom redistribution to adjacent cells, and generation of ordered animation events for clients.

## Requirements
### Requirement: Explosion detection
The system SHALL detect when a cell reaches or exceeds critical mass and trigger an explosion.

#### Scenario: Corner cell explodes at or above 2 atoms
- **WHEN** a corner cell has atom count greater than or equal to 2
- **THEN** the system SHALL trigger an explosion
- **AND** mark the cell for atom distribution

#### Scenario: Edge cell explodes at or above 3 atoms
- **WHEN** an edge cell has atom count greater than or equal to 3
- **THEN** the system SHALL trigger an explosion
- **AND** mark the cell for atom distribution

#### Scenario: Center cell explodes at or above 4 atoms
- **WHEN** a center cell has atom count greater than or equal to 4
- **THEN** the system SHALL trigger an explosion
- **AND** mark the cell for atom distribution

#### Scenario: Cell below critical mass does not explode
- **WHEN** a cell has atoms below its critical mass
- **THEN** the system SHALL NOT trigger an explosion
- **AND** leave the cell unchanged

### Requirement: Atom distribution to adjacent cells
The system SHALL distribute atoms from exploding cells to all adjacent cells and retain overflow atoms in the exploding cell.

#### Scenario: Explosion distributes one atom per neighbor and retains overflow
- **WHEN** a cell explodes
- **THEN** the system SHALL place one atom on each adjacent cell
- **AND** set all receiving cells' owner to the exploding player
- **AND** set the exploding cell atom count to `previousAtoms - adjacentCellCount`
- **AND** keep the exploding cell owner as the exploding player when remaining atoms are greater than 0

#### Scenario: Exploding cell is cleared only when no overflow remains
- **WHEN** an exploding cell has atom count equal to its adjacent cell count
- **THEN** the system SHALL set the exploding cell atom count to 0
- **AND** set the exploding cell owner to null

#### Scenario: Adjacent cells receive atoms correctly
- **WHEN** atoms are distributed from explosion
- **THEN** each adjacent cell SHALL increment its atom count by 1
- **AND** change owner to the exploding player
- **AND** check if the receiving cell now reaches or exceeds critical mass

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
The system SHALL generate an ordered sequence of explosion events for client animation, include immediate representation of retained overflow after each explosion step, and include authoritative timing metadata driven by configurable match settings.

#### Scenario: Explosion sequence is generated
- **WHEN** explosions are resolved on the server
- **THEN** the system SHALL create an ordered array of explosion events
- **AND** each event SHALL include `{ row, col, atoms, player, timestamp }`

#### Scenario: Explosion sequence is sent to clients
- **WHEN** chain reaction completes
- **THEN** the system SHALL send the explosion sequence to all clients
- **AND** clients SHALL animate each explosion sequentially

#### Scenario: Overflow state is represented per explosion step
- **WHEN** an explosion step retains overflow atoms in the source cell
- **THEN** the explosion event sequence SHALL include sufficient state for clients to render the retained source-cell atoms immediately after that step
- **AND** the rendered state SHALL match the authoritative post-step board state

#### Scenario: Animation timing is configurable per match
- **WHEN** explosion sequence is sent
- **THEN** the system SHALL include the configured animation delay from authoritative match timing settings
- **AND** all connected clients SHALL use that value for subsequent explosion-step playback

#### Scenario: Animation timing updates apply to future sequences
- **WHEN** match animation timing is changed during active gameplay
- **THEN** already-generated sequences MAY keep their existing delay values
- **AND** newly generated sequences SHALL use the updated configured delay

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

