## MODIFIED Requirements

### Requirement: Animation coordination
The system SHALL generate an ordered sequence of explosion events for client animation and include authoritative timing metadata driven by configurable match settings.

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

#### Scenario: Animation timing is configurable per match
- **WHEN** explosion sequence is sent
- **THEN** the system SHALL include the configured animation delay from authoritative match timing settings
- **AND** all connected clients SHALL use that value for subsequent explosion-step playback

#### Scenario: Animation timing updates apply to future sequences
- **WHEN** match animation timing is changed during active gameplay
- **THEN** already-generated sequences MAY keep their existing delay values
- **AND** newly generated sequences SHALL use the updated configured delay
