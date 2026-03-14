## MODIFIED Requirements

### Requirement: Animation effects
The system SHALL animate chain reactions with smooth visual effects, reflect retained overflow in source cells immediately after each explosion step, and redraw the full board so ownership and atom updates are visible after every step.

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

#### Scenario: Full board is redrawn after each explosion step
- **WHEN** an explosion step is applied to authoritative game state
- **THEN** the UI SHALL redraw all board cells using the post-step board snapshot
- **AND** the redraw SHALL complete before the next queued explosion animation step begins

#### Scenario: Receiving-cell ownership changes are shown immediately
- **WHEN** a cell receives an atom from an adjacent explosion transfer
- **THEN** the UI SHALL show the receiving cell with the exploding player's ownership immediately in the same post-step redraw cycle
- **AND** SHALL NOT defer the ownership color/state update to later cascade steps

#### Scenario: Animations respect prefers-reduced-motion
- **WHEN** user has `prefers-reduced-motion` enabled
- **THEN** animations SHALL be simplified or skipped
- **AND** state changes SHALL still be clearly visible

#### Scenario: Animation queue processes in order
- **WHEN** multiple explosions occur in sequence
- **THEN** animations SHALL play one after another
- **AND** maintain the cascade order from the server
