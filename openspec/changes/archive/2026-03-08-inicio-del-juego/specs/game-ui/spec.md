# Game UI Specification

## ADDED Requirements

### Requirement: Board grid rendering
The system SHALL render the game board as a responsive grid with CSS Grid layout.

#### Scenario: Board displays as NxN grid
- **WHEN** the game UI loads
- **THEN** the system SHALL render a grid with N rows and N columns
- **AND** use CSS Grid with `grid-template-columns: repeat(N, 1fr)`

#### Scenario: Grid is responsive on mobile
- **WHEN** viewed on a mobile device (viewport < 768px)
- **THEN** the board SHALL scale to fit the screen width
- **AND** maintain square aspect ratio for cells
- **AND** ensure minimum touch target size of 44x44px

#### Scenario: Grid is responsive on desktop
- **WHEN** viewed on a desktop device (viewport >= 992px)
- **THEN** the board SHALL use optimal size for gameplay
- **AND** center horizontally in the layout

### Requirement: Cell components with atom visualization
The system SHALL render each cell with visual indicators for owner, atom count, and interactive state.

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

### Requirement: Player turn indicator
The system SHALL display which player's turn it is with clear visual indication.

#### Scenario: Current player is highlighted
- **WHEN** it is a player's turn
- **THEN** the UI SHALL highlight that player's indicator
- **AND** use color, border, or icon to show active player

#### Scenario: Turn indicator updates immediately
- **WHEN** the turn changes
- **THEN** the UI SHALL update the indicator within 100ms
- **AND** use smooth transition or animation

#### Scenario: Turn indicator is announced to screen readers
- **WHEN** the turn changes
- **THEN** an ARIA live region SHALL announce "Turno de Jugador N"
- **AND** use `aria-live="polite"`

### Requirement: Game controls
The system SHALL provide controls for starting, restarting, and managing games.

#### Scenario: New game button is available
- **WHEN** in SETUP or ENDED state
- **THEN** a "Nueva Partida" button SHALL be visible
- **AND** clicking it SHALL start a new game

#### Scenario: Restart button is available during game
- **WHEN** in ACTIVE state
- **THEN** a "Reiniciar" button SHALL be visible
- **AND** clicking it SHALL prompt for confirmation
- **AND** reset the game on confirmation

#### Scenario: Controls are accessible
- **WHEN** controls are rendered
- **THEN** all buttons SHALL have descriptive `aria-label` attributes
- **AND** be keyboard accessible
- **AND** meet minimum 44x44px touch target size

### Requirement: Win/lose notifications
The system SHALL display clear notifications when a game ends.

#### Scenario: Winner is announced
- **WHEN** a player wins
- **THEN** the UI SHALL display "¡Jugador N gana!" message
- **AND** highlight the winning player with color/animation

#### Scenario: Forfeit is announced
- **WHEN** a player wins by forfeit
- **THEN** the UI SHALL display "Jugador N gana por abandono"

#### Scenario: Notification is accessible
- **WHEN** game ends
- **THEN** the notification SHALL be announced via ARIA live region
- **AND** use `aria-live="assertive"` for immediate attention

### Requirement: Responsive layout for mobile/desktop
The system SHALL adapt the game UI layout for different screen sizes.

#### Scenario: Mobile layout stacks vertically
- **WHEN** viewport width is less than 768px
- **THEN** the UI SHALL stack player indicators above/below the board
- **AND** controls SHALL be full-width buttons

#### Scenario: Desktop layout uses horizontal space
- **WHEN** viewport width is 992px or greater
- **THEN** the UI SHALL position player indicators beside the board
- **AND** use optimal spacing for large screens

### Requirement: Animation effects
The system SHALL animate chain reactions with smooth visual effects.

#### Scenario: Explosion animation is displayed
- **WHEN** a cell explodes
- **THEN** the cell SHALL show explosion animation (scale/fade effect)
- **AND** duration SHALL be approximately 300ms

#### Scenario: Atom distribution is animated
- **WHEN** atoms move to adjacent cells
- **THEN** atoms SHALL animate from source to destination
- **AND** appear with smooth transition

#### Scenario: Animations respect prefers-reduced-motion
- **WHEN** user has `prefers-reduced-motion` enabled
- **THEN** animations SHALL be simplified or skipped
- **AND** state changes SHALL still be clearly visible

#### Scenario: Animation queue processes in order
- **WHEN** multiple explosions occur in sequence
- **THEN** animations SHALL play one after another
- **AND** maintain the cascade order from the server
