## MODIFIED Requirements

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

### Requirement: Animation coordination
The system SHALL generate an ordered sequence of explosion events for client animation, including immediate representation of retained overflow after each explosion step.

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

#### Scenario: Animation timing is configurable
- **WHEN** explosion sequence is sent
- **THEN** the system SHALL include suggested delay between animations (e.g., 300ms)
- **AND** clients MAY adjust timing based on user preference or performance
