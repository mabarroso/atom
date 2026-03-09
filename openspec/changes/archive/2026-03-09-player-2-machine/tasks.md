## 1. Core Machine Player Module

- [x] 1.1 Create `src/server/game/machine-player.js` module with base structure
- [x] 1.2 Implement board cell type classifier (corner/edge/center detection)
- [x] 1.3 Implement adjacent cell finder with boundary validation
- [x] 1.4 Implement critical mass detector for cells
- [x] 1.5 Create probability configuration object with Medium difficulty preset
- [x] 1.6 Implement Rule 1-2: Corner cell offensive rules (99% probability)
- [x] 1.7 Implement Rule 3-5: Edge cell offensive rules (90-99% probability)
- [x] 1.8 Implement Rule 6-9: Center cell offensive rules (85-99% probability)
- [x] 1.9 Implement Rule 10-13: Center cell strategic rules (30-60% probability)
- [x] 1.10 Implement Rule 14-16: Edge cell strategic rules (40-60% probability)
- [x] 1.11 Implement Rule 17-18: Corner cell strategic rules (50-60% probability)
- [x] 1.12 Implement Rule 19-23: Tactical positioning rules (50% probability)
- [x] 1.13 Implement fallback rule: occupy any free cell
- [x] 1.14 Implement `selectMove(board, gameState)` main entry point with rule evaluation loop
- [x] 1.15 Add decision logging with rule index, probability, and selected cell
- [x] 1.16 Export Machine player interface

## 2. Game State Integration

- [x] 2.1 Add `machineMode` boolean flag to game metadata structure in `game-state.js`
- [x] 2.2 Add `isHuman` array to player metadata in `game-state.js`
- [x] 2.3 Update game creation logic to accept `machineMode` parameter (default false)
- [x] 2.4 Set Player 2 metadata: `isHuman[2] = false`, `name = "Machine"` when machineMode is true
- [x] 2.5 Mark Machine player as always connected (skip disconnect handling)
- [x] 2.6 Update game start validation: skip Player 2 join requirement if machineMode is true
- [x] 2.7 Prevent second client from joining when machineMode is true (emit error:game:roomFull)
- [x] 2.8 Include machineMode flag in game state serialization for clients

## 3. Game Engine Automatic Move Execution

- [x] 3.1 Import `machine-player.js` module in `game-engine.js`
- [x] 3.2 Add post-move hook: check if next player is Machine after move completion
- [x] 3.3 Implement 2-second non-blocking delay using `setTimeout` before Machine move
- [x] 3.4 Call `machinePlayer.selectMove(board, gameState)` during Machine turn
- [x] 3.5 Apply Machine-selected move using existing `player-actions.js` validation
- [x] 3.6 Handle null return from Machine (no valid moves) and end game appropriately
- [x] 3.7 Ensure chain reactions resolve completely before checking for next Machine turn
- [x] 3.8 Prevent infinite Machine turn loops (sanity check)

## 4. Socket Communication Updates

- [x] 4.1 Add `server:game:machineMove` event definition in socket handler
- [x] 4.2 Emit `server:game:machineMove` with `{row, col, atoms}` before state update
- [x] 4.3 Broadcast Machine move to all clients in game room
- [x] 4.4 Include machineMode flag in `server:game:started` event payload
- [x] 4.5 Include machineMode flag in `server:statusUpdate` event payload
- [x] 4.6 Update socket handler to include Player 2 type (isHuman) in player metadata broadcasts

## 5. Client UI Updates

- [x] 5.1 Add game mode selection UI: Radio buttons for "vs Human" / "vs Machine" on game creation screen
- [x] 5.2 Send machineMode parameter with `client:game:start` event based on selection
- [x] 5.3 Update client game state manager to store machineMode flag
- [x] 5.4 Add listener for `server:game:machineMove` event in client
- [x] 5.5 Implement cell highlight/flash animation when Machine move is received
- [x] 5.6 Update player labels: show "Machine" for Player 2 when in Machine mode
- [x] 5.7 Hide "Waiting for Player 2" message when machineMode is true
- [x] 5.8 Update game flow messaging: adjust turn indicators for Machine opponent

## 6. Unit Tests - Machine Player Logic

- [x] 6.1 Test cell type classification: corners, edges, centers on various board sizes
- [x] 6.2 Test adjacent cell finder: boundary cases, all cell positions
- [x] 6.3 Test critical mass detection for corner/edge/center cells
- [x] 6.4 Test Rule 1-2: Corner offensive scenarios with Player 1 at critical mass
- [x] 6.5 Test Rule 3-9: Edge and center offensive scenarios
- [x] 6.6 Test Rule 10-18: Strategic positioning scenarios
- [x] 6.7 Test Rule 19-23: Tactical rules (free cell occupation)
- [x] 6.8 Test fallback rule invocation when no other rules succeed
- [x] 6.9 Test probability threshold evaluation (mock Math.random)
- [x] 6.10 Test decision logging output format and content

## 7. Integration Tests - Game Flow

- [x] 7.1 Test Human vs Machine game creation with machineMode flag
- [x] 7.2 Test Machine prevents second human player from joining
- [x] 7.3 Test game starts immediately without waiting for Player 2 in Machine mode
- [x] 7.4 Test Player 1 makes move, Machine responds automatically after delay
- [x] 7.5 Test Machine move triggers chain reactions correctly
- [x] 7.6 Test turn alternates between Player 1 and Machine properly
- [x] 7.7 Test win condition detected when Player 1 eliminates Machine's atoms
- [x] 7.8 Test win condition detected when Machine eliminates Player 1's atoms
- [x] 7.9 Test `server:game:machineMove` event broadcasts to clients
- [x] 7.10 Test game state includes machineMode and Player 2 metadata correctly

## 8. E2E Tests - User Flows

- [x] 8.1 Test player selects "vs Machine" mode and starts game successfully
- [x] 8.2 Test Machine move is visible with animation in client UI
- [x] 8.3 Test complete game flow: Player 1 vs Machine from start to win
- [x] 8.4 Test Machine thinking delay is approximately 2 seconds (no visible message)
- [x] 8.5 Test player labels show "Machine" for Player 2
- [x] 8.6 Test accessibility: Machine moves announced via aria-live regions

## 9. Documentation and Finalization

- [x] 9.1 Update README.md: add "Single Player (vs Machine)" to game modes
- [x] 9.2 Document Machine decision rules in code comments (reference project.md)
- [x] 9.3 Add JSDoc comments to machine-player.js public interface
- [x] 9.4 Update Socket Events documentation: add `server:game:machineMove`
- [x] 9.5 Verify all tests pass (unit, integration, E2E)
- [x] 9.6 Verify linting passes with no warnings
- [ ] 9.7 Commit changes with message: "feat: add Machine player AI opponent for single-player mode"
