# Game UI Specification

## Purpose
This capability covers the Atom gameplay interface: responsive board rendering, interactive and accessible cells, player/turn indicators, game controls and notifications, and visual animation behavior across device sizes.
## Requirements
### Requirement: Board grid rendering
The system SHALL render the game board as a responsive grid with CSS Grid layout and square cells.

#### Scenario: Board displays as NxN grid
- **WHEN** the game UI loads
- **THEN** the system SHALL render a grid with N rows and N columns
- **AND** use CSS Grid with `grid-template-columns: repeat(N, 1fr)`

#### Scenario: Cells have equal side length
- **WHEN** board cells are rendered
- **THEN** each cell SHALL have equal width and height
- **AND** preserve square geometry across supported board sizes

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

### Requirement: Player turn indicator
The system SHALL display which player's turn it is with clear visual indication and include the current turn number.

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

#### Scenario: Turn number is visible during active gameplay
- **WHEN** the game is in ACTIVE state
- **THEN** the UI SHALL display the current turn number in the gameplay status area
- **AND** the displayed number SHALL match the authoritative game-state turn number

#### Scenario: Turn number updates after each valid turn progression
- **WHEN** a valid move is applied and turn control advances
- **THEN** the UI SHALL update the turn number in the same state refresh cycle
- **AND** the update SHALL be visible in both player-vs-player and player-vs-machine modes

#### Scenario: Reconnection restores current turn number
- **WHEN** a client reconnects and receives synchronized game state
- **THEN** the UI SHALL render the current turn number from the latest state snapshot
- **AND** SHALL NOT reset to an initial value unless a new game starts

### Requirement: Game controls
The system SHALL provide controls for starting, restarting, managing games, revealing atom counters according to player permissions, and modifying match timing settings.

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
- **THEN** all buttons and timing inputs SHALL have descriptive `aria-label` attributes
- **AND** be keyboard accessible
- **AND** meet minimum 44x44px touch target size for interactive controls

#### Scenario: Atom counters are hidden by default
- **WHEN** a game starts or restarts
- **THEN** the atom counter panel SHALL be hidden
- **AND** no atom totals SHALL be visible to either player

#### Scenario: Player 1 can reveal atom counters for everyone
- **WHEN** Player 1 activates the reveal counters control during an active game
- **THEN** the UI SHALL display Player 1 atom count, Player 2 atom count, and total atoms
- **AND** counters SHALL become visible to all connected players in the same match

#### Scenario: Player 2 cannot reveal atom counters
- **WHEN** Player 2 attempts to activate the reveal counters control
- **THEN** the UI SHALL not reveal counters from that action
- **AND** visibility SHALL remain controlled only by authoritative server state

#### Scenario: Reconnection preserves counter visibility state
- **WHEN** a client reconnects and receives synchronized state
- **THEN** the UI SHALL render counters visible or hidden according to authoritative visibility state
- **AND** rendered values SHALL match authoritative counts from synchronized state

#### Scenario: Timing controls are visible during active gameplay
- **WHEN** timing settings are available for the current match
- **THEN** the UI SHALL show one control for animation speed and one control for machine response time
- **AND** each control SHALL display the current authoritative value

#### Scenario: Timing control updates are synchronized
- **WHEN** a timing control value is changed and accepted by authoritative game state
- **THEN** the UI SHALL update displayed timing values for all connected clients in the same match
- **AND** subsequent gameplay pacing SHALL use the updated values

#### Scenario: Machine response time accepts zero milliseconds
- **WHEN** machine response time is set to `0`
- **THEN** the UI SHALL accept and display `0 ms` as a valid value
- **AND** machine turns SHALL remain functional without introducing extra artificial delay

#### Scenario: Reconnection restores timing control values
- **WHEN** a client reconnects and receives synchronized state
- **THEN** the UI SHALL render animation speed and machine response values from authoritative state
- **AND** SHALL NOT reset to defaults unless a new game or reset applies default timing policy

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

