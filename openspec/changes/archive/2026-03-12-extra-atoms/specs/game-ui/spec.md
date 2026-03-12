## MODIFIED Requirements

### Requirement: Cell components with atom visualization
The system SHALL render each cell with visual indicators for owner, atom count, interactive state, the most recent move origin, and deterministic atom-placement geometry.

#### Scenario: Empty cell is displayed
- **WHEN** a cell has zero atoms
- **THEN** the cell SHALL display as empty with neutral background
- **AND** show no atoms or owner indicator

#### Scenario: Cell with atoms shows count
- **WHEN** a cell has atoms
- **THEN** the cell SHALL display the atom count visually
- **AND** use circles or dots to represent atoms for counts from 1 to 4
- **AND** apply player color to the atoms

#### Scenario: One atom is centered
- **WHEN** a cell contains exactly 1 atom
- **THEN** that atom SHALL be rendered at the geometric center of the cell

#### Scenario: Two atoms are arranged diagonally
- **WHEN** a cell contains exactly 2 atoms
- **THEN** atoms SHALL be rendered on a top-left to bottom-right diagonal
- **AND** both atoms SHALL keep equal distance from the relevant cell edges

#### Scenario: Three atoms form upward equilateral triangle
- **WHEN** a cell contains exactly 3 atoms
- **THEN** atoms SHALL be arranged as an equilateral triangle pointing upward
- **AND** spacing between each pair of atoms SHALL be equal

#### Scenario: Cell with more than 4 atoms uses compact layout and raw total
- **WHEN** a cell contains more than 4 atoms
- **THEN** the cell SHALL render a stable 3-atom layout for the owning player
- **AND** SHALL display the raw total atom count value in the remaining display slot
- **AND** SHALL NOT truncate or cap the displayed numeric value

#### Scenario: Atom spacing and edge margin are consistent
- **WHEN** atom layouts are rendered inside a cell
- **THEN** atoms SHALL be equidistant from each other for the selected layout
- **AND** a consistent margin model SHALL be applied between atoms and cell edges

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

### Requirement: Animation effects
The system SHALL animate chain reactions with smooth visual effects and reflect retained overflow in source cells immediately after each explosion step.

#### Scenario: Explosion animation is displayed
- **WHEN** a cell explodes
- **THEN** the cell SHALL show explosion animation (scale/fade effect)
- **AND** duration SHALL be approximately 300ms

#### Scenario: Atom distribution is animated
- **WHEN** atoms move to adjacent cells
- **THEN** atoms SHALL animate from source to destination
- **AND** appear with smooth transition

#### Scenario: Retained overflow is shown immediately after each explosion step
- **WHEN** an explosion step finishes distributing one atom to each adjacent cell
- **THEN** the source cell SHALL immediately render any retained overflow atoms for that step
- **AND** this render SHALL occur before the next queued explosion animation step begins

#### Scenario: Animations respect prefers-reduced-motion
- **WHEN** user has `prefers-reduced-motion` enabled
- **THEN** animations SHALL be simplified or skipped
- **AND** state changes SHALL still be clearly visible

#### Scenario: Animation queue processes in order
- **WHEN** multiple explosions occur in sequence
- **THEN** animations SHALL play one after another
- **AND** maintain the cascade order from the server
