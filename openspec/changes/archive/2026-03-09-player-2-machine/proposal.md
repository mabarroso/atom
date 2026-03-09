## Why

Currently, the game requires two human players, limiting the target audience to multiplayer scenarios and reducing user engagement during waiting periods. Implementing an AI opponent (Machine player) enables single-player gameplay, provides immediate entertainment without requiring a second player, and expands the game's appeal to casual players. This is particularly important for adoption during off-peak hours when finding opponents may be difficult.

## What Changes

- Adds option to play against AI opponent instead of requiring human Player 2
- Introduces automatic move selection for Machine player based on documented probability-weighted decision rules
- Implements server-side move execution for Machine turns without requiring Socket.io client interaction
- Adds UI affordance to select game mode (Human vs Human, or Human vs Machine) during game creation
- Enables smooth game flow where Machine moves execute automatically after human Player 1 turn completes

## Capabilities

### New Capabilities

- `machine-player`: Covers AI decision-making logic for Player 2. Implements probabilistic move selection following the documented Machine Rules (23 distinct decision scenarios with weighted probabilities). Handles board analysis, cell type classification, adjacent cell evaluation, and move selection.

### Modified Capabilities

- `game-state`: Player 2 can now be Machine instead of human. Requires handling Machine player metadata, automatic turn triggering for Machine moves (no client event), and seamless state updates for AI-generated moves.
- `player-actions`: Move validation and application must work identically for Machine-generated moves as for human moves. Machine moves still trigger same chain reactions and game-state updates.
- `socket-communication`: Server needs ability to generate and apply Machine moves without waiting for `client:game:move` event. Client should subscribe to `server:game:machineMove` event (or similar) to receive and visualize Machine's selected cell.

## Impact

**Affected Files:**
- `src/server/game/game-engine.js` - Add Machine player detection and automatic move triggering
- `src/server/game/game-state.js` - Track if Player 2 is Machine; add machine flag to player metadata
- `src/server/game/player-actions.js` - Move validation and application logic (unchanged, works as-is)
- *NEW*: `src/server/game/machine-player.js` - Implements all 23 decision rules with probability weighting
- `src/client/js/game/game-ui.js` - Add game mode selection UI (Human vs Human, Human vs Machine)
- `src/client/js/game/game-state-manager.js` - Handle incoming Machine moves from server
- Test files: Add unit tests for Machine decision logic, integration tests for game flow with AI

**APIs:**
- New server endpoint or event: Machine move generation (internal, server-side only)
- New client event: When Machine move is selected, broadcast which cell was chosen so client can display/animate it

**No breaking changes** - human vs human games remain unchanged. Machine option is new, opt-in functionality.
