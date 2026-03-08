# Client Structure Specification (Delta)

## ADDED Requirements

### Requirement: Game board container integration
The system SHALL integrate a game board container into the existing HTML structure within the Bootstrap layout.

#### Scenario: Game board container is added to main layout
- **WHEN** the HTML page is loaded
- **THEN** a game board container element SHALL exist in the main section
- **AND** use id="game-container" for JavaScript targeting
- **AND** be placed after the connection status area

#### Scenario: Game board uses Bootstrap grid
- **WHEN** the game board is rendered
- **THEN** it SHALL use Bootstrap row and col classes for responsive layout
- **AND** adapt to mobile (col-12) and desktop (col-lg-8 col-xl-6) viewports

### Requirement: Game UI component organization
The system SHALL organize game-specific JavaScript modules separately from core infrastructure modules.

#### Scenario: Game modules are loaded as ES6 modules
- **WHEN** the page loads game functionality
- **THEN** game modules SHALL be loaded with `type="module"`
- **AND** be organized as: `game-board.js`, `game-ui.js`, `game-state-manager.js`

#### Scenario: Game modules import from existing modules
- **WHEN** game modules need Socket.io connection
- **THEN** they SHALL import from existing `socket-client.js`
- **AND** reuse the established connection
- **AND** not create duplicate Socket.io instances

### Requirement: Game-specific CSS integration
The system SHALL include game-specific styles in the custom CSS file without breaking existing styles.

#### Scenario: Game CSS is added to custom.css
- **WHEN** game UI is rendered
- **THEN** game-specific styles SHALL be in `src/client/css/custom.css`
- **AND** use namespaced class names (`.game-board`, `.game-cell`, `.atom`)
- **AND** not override Bootstrap base styles

#### Scenario: Game CSS is responsive
- **WHEN** game styles are applied
- **THEN** media queries SHALL adapt layout for mobile, tablet, desktop
- **AND** follow mobile-first approach consistent with existing code

### Requirement: Game controls accessibility
The system SHALL maintain existing WCAG 2.2 Level AA compliance when adding game controls.

#### Scenario: Game cells have ARIA labels
- **WHEN** game board is rendered
- **THEN** each cell SHALL have `aria-label` in Spanish
- **AND** describe cell position and state (e.g., "Celda fila 2 columna 3, vacía")

#### Scenario: Game state changes are announced
- **WHEN** game state changes (turn, explosion, win)
- **THEN** ARIA live regions SHALL announce changes
- **AND** use `aria-live="polite"` for non-critical updates
- **AND** use `aria-live="assertive"` for game end

#### Scenario: Game is keyboard navigable
- **WHEN** user navigates game with keyboard
- **THEN** all cells and controls SHALL be reachable with Tab
- **AND** cells SHALL activate with Enter or Space
- **AND** focus indicators SHALL be visible

### Requirement: Spanish language consistency
The system SHALL display all game UI text in Spanish consistent with existing UI language.

#### Scenario: Game labels are in Spanish
- **WHEN** game UI is rendered
- **THEN** all labels SHALL be in Spanish (e.g., "Nueva Partida", "Reiniciar", "Turno de Jugador 1")

#### Scenario: Game messages are in Spanish
- **WHEN** game displays messages (errors, notifications)
- **THEN** all message text SHALL be in Spanish
- **AND** follow existing terminology conventions

### Requirement: Layout adaptation for game mode
The system SHALL adapt the page layout when game is active to optimize space for gameplay.

#### Scenario: Game container is prominently displayed
- **WHEN** game is in ACTIVE or SETUP state
- **THEN** the game container SHALL be the primary focus
- **AND** use most of the viewport space

#### Scenario: Connection status remains visible
- **WHEN** game is displayed
- **THEN** the existing connection status indicator SHALL remain visible
- **AND** be positioned to not interfere with game board
- **AND** maintain its real-time update functionality
