# Player Actions Specification (Delta)

## Purpose
No changes to player action validation or move application logic. Machine-generated moves use identical validation and atom placement as human moves.

## ADDED Requirements

###Requirement: Machine move validation
The system SHALL validate Machine-generated moves using the same rules as human player moves.

#### Scenario: Machine move validated identically
- **WHEN** Machine selects a cell to play
- **THEN** the system SHALL apply standard move validation
- **AND** reject invalid Machine moves with same error handling

#### Scenario: Machine obeys turn order
- **WHEN** Machine is Player 2
- **THEN** the system SHALL only accept Machine moves during Player 2's turn
- **AND** reject moves if not Machine's turn

### Requirement: Machine move application
The system SHALL apply Machine moves using existing atom placement and chain reaction logic without modification.

#### Scenario: Machine move triggers chain reactions
- **WHEN** Machine places atom causing critical mass
- **THEN** the system SHALL resolve explosions identically to human moves
- **AND** apply same adjacency distribution rules

#### Scenario: Machine move updates game state
- **WHEN** Machine completes a valid move
- **THEN** the system SHALL update board state
- **AND** switch turn to Player 1
- **AND** check win conditions
