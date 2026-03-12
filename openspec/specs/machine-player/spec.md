# Machine Player Specification

## Purpose
This capability covers AI decision-making logic for Player 2 in single-player mode. Implements probabilistic move selection following 23 documented decision rules, board analysis for cell type classification and adjacency evaluation, and move selection with logging support.

## Requirements

### Requirement: Board analysis
The system SHALL analyze the game board to identify cell types, critical mass states, and player ownership for AI decision-making.

#### Scenario: Identify corner cells
- **WHEN** Machine analyzes the board
- **THEN** the system SHALL correctly identify all corner cells (2 adjacent cells)
- **AND** return their coordinates and current state

#### Scenario: Identify edge cells
- **WHEN** Machine analyzes the board
- **THEN** the system SHALL correctly identify all edge cells (3 adjacent cells)
- **AND** return their coordinates and current state

#### Scenario: Identify center cells
- **WHEN** Machine analyzes the board
- **THEN** the system SHALL correctly identify all center cells (4 adjacent cells)
- **AND** return their coordinates and current state

#### Scenario: Detect cells at critical mass
- **WHEN** Machine evaluates cells for reaction potential
- **THEN** the system SHALL identify cells where atoms equal critical mass threshold
- **AND** mark them as high-priority targets

#### Scenario: Find adjacent cells
- **WHEN** Machine evaluates a specific cell
- **THEN** the system SHALL return all valid adjacent cells (up/down/left/right)
- **AND** exclude out-of-bounds positions

### Requirement: Decision rule evaluation
The system SHALL evaluate 23 probabilistic decision rules in priority order and select the first rule that succeeds.

#### Scenario: High-priority offensive rules (99% probability)
- **WHEN** a corner cell has 1+ adjacent cells occupied by Player 1 at critical mass
- **THEN** the system SHALL evaluate with 99% probability
- **AND** select move to trigger reaction if rule succeeds

#### Scenario: Medium-priority offensive rules (85-95% probability)
- **WHEN** edge or center cells have adjacent Player 1 cells at critical mass
- **THEN** the system SHALL evaluate with appropriate probability (85-95%)
- **AND** select move to trigger reaction if rule succeeds

#### Scenario: Medium-priority strategic rules (30-60% probability)
- **WHEN** cells have adjacent Player 1 cells (not at critical mass)
- **THEN** the system SHALL evaluate with appropriate probability (30-60%)
- **AND** select move to create reaction potential if rule succeeds

#### Scenario: Low-priority tactical rules (50% probability)
- **WHEN** no high-priority moves available
- **THEN** the system SHALL evaluate tactical positioning (occupy corners, edges)
- **AND** select move with 50% probability if rule succeeds

#### Scenario: Fallback rule
- **WHEN** no rules succeed in evaluation
- **THEN** the system SHALL select any valid free cell
- **AND** add atom to maintain game progress

### Requirement: Move selection
The system SHALL select exactly one valid move per turn based on rule evaluation results.

#### Scenario: Return selected cell
- **WHEN** Machine completes decision evaluation
- **THEN** the system SHALL return cell coordinates {row, col}
- **AND** ensure the cell is valid for current board state

#### Scenario: No valid moves available
- **WHEN** board has no legal moves for Machine
- **THEN** the system SHALL return null
- **AND** allow game engine to handle end-game state

### Requirement: Decision logging
The system SHALL log each decision for debugging and analytics purposes.

#### Scenario: Log selected rule
- **WHEN** Machine selects a move
- **THEN** the system SHALL log rule index, probability, and selected cell
- **AND** include timestamp and board state hash

#### Scenario: Log fallback invocation
- **WHEN** fallback rule is used
- **THEN** the system SHALL log "fallback" as rule identifier
- **AND** include warning for unexpected fallbacks

### Requirement: Thinking delay
The system SHALL use configurable machine response delay before executing Machine move, including `0 ms`, to support match pacing controls.

#### Scenario: Delay before move broadcast uses configured value
- **WHEN** Machine selects a move
- **THEN** the system SHALL wait the configured machine response delay before applying move
- **AND** not display visible "thinking" message to client

#### Scenario: Zero-delay machine response is supported
- **WHEN** configured machine response delay is `0 ms`
- **THEN** the system SHALL execute the Machine move without additional artificial wait
- **AND** preserve the same move-validation and turn-progression rules

#### Scenario: Delay does not block server
- **WHEN** machine response delay is active
- **THEN** the system SHALL use non-blocking scheduling
- **AND** allow other game operations to continue

#### Scenario: Updated delay applies to subsequent machine turns
- **WHEN** machine response delay is changed during an active match
- **THEN** already scheduled moves MAY keep their original delay
- **AND** future machine turns SHALL use the updated delay value

### Requirement: Difficulty level support
The system SHALL support configurable difficulty levels for future extensibility.

#### Scenario: Load probability configuration
- **WHEN** Machine initializes
- **THEN** the system SHALL load probabilities from difficulty config
- **AND** default to "Medium" preset if not specified

#### Scenario: Future difficulty selection
- **WHEN** difficulty level changes (future feature)
- **THEN** the system SHALL apply adjusted probabilities
- **AND** maintain same rule evaluation logic
