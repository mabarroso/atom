## MODIFIED Requirements

### Requirement: Atom distribution to adjacent cells
The system SHALL distribute atoms from exploding cells to all adjacent cells, retain overflow atoms in the exploding cell, and apply receiving-cell ownership changes immediately during each explosion step.

#### Scenario: Explosion distributes one atom per neighbor and retains overflow
- **WHEN** a cell explodes
- **THEN** the system SHALL place one atom on each adjacent cell
- **AND** set all receiving cells' owner to the exploding player in the same distribution step
- **AND** set the exploding cell atom count to `previousAtoms - adjacentCellCount`
- **AND** keep the exploding cell owner as the exploding player when remaining atoms are greater than 0

#### Scenario: Exploding cell is cleared only when no overflow remains
- **WHEN** an exploding cell has atom count equal to its adjacent cell count
- **THEN** the system SHALL set the exploding cell atom count to 0
- **AND** set the exploding cell owner to null

#### Scenario: Adjacent cells receive atoms correctly
- **WHEN** atoms are distributed from explosion
- **THEN** each adjacent cell SHALL increment its atom count by 1
- **AND** change owner to the exploding player immediately after the transfer is applied
- **AND** check if the receiving cell now reaches or exceeds critical mass

#### Scenario: Ownership transfer is authoritative per explosion step
- **WHEN** an adjacent cell receives a transferred atom during cascade resolution
- **THEN** the receiving cell owner SHALL match the exploding player in the authoritative post-step board state
- **AND** downstream cascade checks SHALL evaluate that receiving cell using the updated owner and atom count
