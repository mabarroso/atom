# Game UI Specification

## MODIFIED Requirements

### Requirement: Cell components with atom visualization
The system SHALL render each cell with visual indicators for owner, atom count, interactive state, and the most recent move origin.

#### Scenario: Empty cell is displayed
- **WHEN** a cell has zero atoms
- **THEN** the cell SHALL display as empty with neutral background
- **AND** show no atoms or owner indicator

#### Scenario: Cell with atoms shows count
- **WHEN** a cell has atoms
- **THEN** the cell SHALL display the atom count visually
- **AND** use circles or dots to represent atoms (1-4)
- **AND** apply player color to the atoms

#### Scenario: Cell shows owner color
- **WHEN** a cell is owned by a player
- **THEN** the cell SHALL have a border or background in the player's color
- **AND** Player 1 cells use blue (#007bff)
- **AND** Player 2 cells use orange (#fd7e14)

#### Scenario: Cell is keyboard accessible
- **WHEN** a user navigates with keyboard
- **THEN** each cell SHALL be focusable with Tab key
- **AND** show visible focus indicator
- **AND** activate on Enter or Space key

#### Scenario: Cell has ARIA labels
- **WHEN** a screen reader reads the board
- **THEN** each cell SHALL have `aria-label` in Spanish (e.g., "Celda fila 3 columna 2, 1 átomo, Jugador 1")
- **AND** include current state (empty, atom count, owner)

#### Scenario: Last move origin is highlighted after a valid move
- **WHEN** a player makes a valid move in a cell
- **THEN** the UI SHALL visually highlight that move-origin cell
- **AND** only one cell SHALL be highlighted as last move at a time

#### Scenario: Last move highlight persists until the next valid move
- **WHEN** the current last-move cell is highlighted
- **THEN** the highlight SHALL remain visible through turn changes and reaction animations
- **AND** remain until another valid move is accepted

#### Scenario: Next valid move replaces previous last-move highlight
- **WHEN** a subsequent valid move is accepted in a different cell
- **THEN** the UI SHALL remove highlight from the previous last-move cell
- **AND** apply highlight to the new move-origin cell

#### Scenario: Rejected move does not change last-move highlight
- **WHEN** a player attempts an invalid or rejected move
- **THEN** the UI SHALL keep the existing last-move highlight unchanged

#### Scenario: Machine move updates last-move highlight
- **WHEN** machine mode is active and the machine performs a valid move
- **THEN** the UI SHALL update the last-move highlight to the machine move-origin cell
