# Game Board Specification

## Purpose
This capability covers the Atom board model: NxN grid initialization, cell ownership and atom tracking, adjacent-cell and critical-mass calculations, and board state serialization for transport and recovery.

## Requirements
### Requirement: NxN grid initialization
The system SHALL initialize a square game board with configurable dimensions (NxN cells) where N is between 4 and 10, defaulting to 6x6.

#### Scenario: Default board is 6x6
- **WHEN** a new game is created without specifying board size
- **THEN** the system SHALL create a 6x6 grid
- **AND** initialize all cells with zero atoms and no owner

#### Scenario: Custom board size is validated
- **WHEN** a game is created with board size N
- **THEN** the system SHALL validate that N is between 4 and 10 inclusive
- **AND** reject invalid sizes with an error message

#### Scenario: Board structure is accessible
- **WHEN** game logic needs to access a cell
- **THEN** the system SHALL provide cells as a 2D array `cells[row][col]`
- **AND** each cell SHALL contain `{ player: null|1|2, atoms: 0 }`

### Requirement: Cell ownership tracking
The system SHALL track which player owns each cell based on who last placed an atom there.

#### Scenario: Unowned cell is claimed
- **WHEN** a player places an atom on an empty cell (atoms=0)
- **THEN** that cell SHALL be assigned to the player
- **AND** the cell's player property SHALL be set to the player number (1 or 2)

#### Scenario: Owned cell retains owner
- **WHEN** a player places an atom on their own cell
- **THEN** the cell SHALL remain owned by that player
- **AND** the atom count SHALL increment

#### Scenario: Cell ownership changes on explosion
- **WHEN** atoms from an explosion are distributed to adjacent cells
- **THEN** receiving cells SHALL change ownership to the exploding player
- **AND** retain that ownership until another player's atoms reach them

### Requirement: Adjacent cell calculation
The system SHALL calculate adjacent cells (up, down, left, right) for any given cell with proper bounds checking.

#### Scenario: Center cell has 4 neighbors
- **WHEN** calculating neighbors for a center cell (not on edge)
- **THEN** the system SHALL return 4 adjacent cells: up, down, left, right
- **AND** exclude diagonal cells

#### Scenario: Edge cell has 3 neighbors
- **WHEN** calculating neighbors for an edge cell (not corner)
- **THEN** the system SHALL return 3 adjacent cells
- **AND** exclude out-of-bounds positions

#### Scenario: Corner cell has 2 neighbors
- **WHEN** calculating neighbors for a corner cell
- **THEN** the system SHALL return 2 adjacent cells
- **AND** exclude out-of-bounds positions

### Requirement: Critical mass determination
The system SHALL determine critical mass for each cell based on its position: corners=2, edges=3, center=4.

#### Scenario: Corner cell critical mass is 2
- **WHEN** checking critical mass for a corner cell
- **THEN** the system SHALL return 2
- **AND** the cell SHALL explode when atom count reaches 2

#### Scenario: Edge cell critical mass is 3
- **WHEN** checking critical mass for an edge cell (not corner)
- **THEN** the system SHALL return 3
- **AND** the cell SHALL explode when atom count reaches 3

#### Scenario: Center cell critical mass is 4
- **WHEN** checking critical mass for a center cell
- **THEN** the system SHALL return 4
- **AND** the cell SHALL explode when atom count reaches 4

### Requirement: Board state serialization
The system SHALL serialize board state for transmission over Socket.io and persistence.

#### Scenario: Board can be serialized to JSON
- **WHEN** the board needs to be sent to clients
- **THEN** the system SHALL convert the board to a JSON-safe object
- **AND** include all cell states and board dimensions

#### Scenario: Board can be deserialized from JSON
- **WHEN** receiving board state from storage or network
- **THEN** the system SHALL reconstruct the board data structure
- **AND** validate all cell properties are valid

