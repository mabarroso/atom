## MODIFIED Requirements

### Requirement: Socket.io client integration
The system SHALL integrate the Socket.io client library and establish connection to the server on page load without requiring a dedicated connection-status panel or manual status-request button in the gameplay UI.

#### Scenario: Socket connection is established
- **WHEN** the page finishes loading
- **THEN** the Socket.io client SHALL attempt to connect to the server
- **AND** the connection handling SHALL remain functional for game features

#### Scenario: No dedicated connection-status controls are rendered
- **WHEN** the main game UI is rendered
- **THEN** the UI SHALL NOT render the "Estado de conexión" box
- **AND** the UI SHALL NOT render the "Solicitar estado" button

### Requirement: Game board container integration
The system SHALL integrate a game board container into the existing HTML structure within the Bootstrap layout.

#### Scenario: Game board container is added to main layout
- **WHEN** the HTML page is loaded
- **THEN** a game board container element SHALL exist in the main section
- **AND** use id="game-container" for JavaScript targeting
- **AND** be placed within the primary gameplay layout without dependency on a connection-status area

#### Scenario: Game board uses Bootstrap grid
- **WHEN** the game board is rendered
- **THEN** it SHALL use Bootstrap row and col classes for responsive layout
- **AND** adapt to mobile (col-12) and desktop (col-lg-8 col-xl-6) viewports

### Requirement: Layout adaptation for game mode
The system SHALL adapt the page layout when game is active to optimize space for gameplay.

#### Scenario: Game container is prominently displayed
- **WHEN** game is in ACTIVE or SETUP state
- **THEN** the game container SHALL be the primary focus
- **AND** use most of the viewport space

#### Scenario: Status layout excludes dedicated connection panel
- **WHEN** game controls and status area are displayed
- **THEN** the layout SHALL NOT include a standalone connection-status panel
- **AND** the remaining status controls SHALL not be blocked by removed connection controls
