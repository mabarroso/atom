# Client Structure Specification

## Purpose

This capability covers the HTML5/CSS3/JavaScript client architecture for the Atom game. It defines semantic markup, Bootstrap integration, responsive design, ES6 module organization, Socket.io client integration, WCAG 2.2 Level AA accessibility compliance, Spanish language UI, and custom CSS conventions.

## Requirements
### Requirement: HTML structure with semantic markup
The system SHALL provide an HTML5 document structure with semantic elements and proper meta tags for responsive behavior and accessibility.

#### Scenario: Base HTML structure is valid
- **WHEN** the HTML document is loaded
- **THEN** it SHALL include a valid DOCTYPE declaration
- **AND** include viewport meta tag for responsive design
- **AND** include charset meta tag (UTF-8)
- **AND** use semantic HTML5 elements (header, main, footer, nav, section)

### Requirement: Bootstrap integration
The system SHALL integrate Bootstrap 5 CSS framework for responsive layout and styling, loaded from CDN or local files.

#### Scenario: Bootstrap CSS is loaded
- **WHEN** the HTML page is rendered
- **THEN** Bootstrap 5 CSS SHALL be loaded and functional
- **AND** Bootstrap utility classes SHALL be available for use
- **AND** the grid system SHALL respond to different viewport sizes

#### Scenario: Bootstrap JavaScript is loaded
- **WHEN** interactive Bootstrap components are used
- **THEN** Bootstrap 5 JavaScript SHALL be loaded
- **AND** interactive components (modals, tooltips, etc.) SHALL function correctly

### Requirement: Responsive design
The system SHALL implement a mobile-first responsive design that adapts to desktop, tablet, and mobile viewports.

#### Scenario: Layout adapts to mobile viewport
- **WHEN** the page is viewed on a mobile device (viewport width < 768px)
- **THEN** the layout SHALL stack vertically
- **AND** all interactive elements SHALL be accessible via touch
- **AND** text SHALL be readable without horizontal scrolling

#### Scenario: Layout adapts to desktop viewport
- **WHEN** the page is viewed on a desktop device (viewport width >= 992px)
- **THEN** the layout SHALL use horizontal space efficiently
- **AND** navigation elements SHALL be displayed in full

### Requirement: JavaScript module organization
The system SHALL organize client-side JavaScript using ES6 modules with clear separation of concerns.

#### Scenario: JavaScript modules are loaded
- **WHEN** the page loads
- **THEN** JavaScript SHALL be loaded as ES6 modules (type="module")
- **AND** modules SHALL be separated by concern (socket-client, DOM manipulation, game state)
- **AND** no global variables SHALL pollute the window object

### Requirement: Socket.io client integration
The system SHALL integrate the Socket.io client library and establish connection to the server on page load.

#### Scenario: Socket connection is established
- **WHEN** the page finishes loading
- **THEN** the Socket.io client SHALL attempt to connect to the server
- **AND** a connection status indicator SHALL display the connection state

#### Scenario: Connection status is displayed
- **WHEN** the socket connection state changes (connecting, connected, disconnected)
- **THEN** the UI SHALL update to reflect the current connection state
- **AND** display appropriate visual feedback to the user

### Requirement: Accessibility compliance
The system SHALL comply with WCAG 2.2 Level AA accessibility standards.

#### Scenario: Interactive elements are keyboard accessible
- **WHEN** a user navigates using only a keyboard
- **THEN** all interactive elements SHALL be reachable via Tab key
- **AND** have visible focus indicators
- **AND** be operable using keyboard only

#### Scenario: Screen reader compatibility
- **WHEN** a screen reader is used
- **THEN** all interactive elements SHALL have appropriate ARIA labels or text alternatives
- **AND** dynamic content changes SHALL be announced
- **AND** the page structure SHALL be navigable by landmarks

### Requirement: Spanish language for UI
The system SHALL display all user-facing text (labels, buttons, messages) in Spanish.

#### Scenario: UI text is in Spanish
- **WHEN** the page is rendered
- **THEN** all labels, buttons, and headings SHALL be in Spanish
- **AND** user-facing error messages SHALL be in Spanish
- **AND** placeholder text SHALL be in Spanish

### Requirement: Custom CSS for game-specific styles
The system SHALL support custom CSS for game-specific visual elements while minimizing custom styles in favor of Bootstrap.

#### Scenario: Custom CSS file is loaded
- **WHEN** the page loads
- **THEN** a custom CSS file SHALL be loaded after Bootstrap
- **AND** contain only game-specific styles (board, atoms, game pieces)
- **AND** not override Bootstrap base styles unnecessarily

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

