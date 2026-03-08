## 1. Project Setup

- [x] 1.1 Review existing code structure and identify integration points
- [x] 1.2 Create directory structure for game modules (src/server/game/, src/client/js/game/)
- [x] 1.3 Document game constants (default board size, colors, delays) in shared constants file

## 2. Server: Game Board Module

- [x] 2.1 Create src/server/game/game-board.js with Board class
- [x] 2.2 Implement board initialization with configurable NxN dimensions
- [x] 2.3 Implement cell structure (2D array with player and atoms properties)
- [x] 2.4 Add getAdjacentCells(row, col) method with bounds checking
- [x] 2.5 Add getCriticalMass(row, col) method (corner=2, edge=3, center=4)
- [x] 2.6 Add board serialization methods (toJSON, fromJSON)
- [x] 2.7 Add cell state query methods (isEmpty, getOwner, getAtomCount)

## 3. Server: Game State Module

- [x] 3.1 Create src/server/game/game-state.js with GameState class
- [x] 3.2 Implement state machine (SETUP, ACTIVE, ENDED) with transition methods
- [x] 3.3 Implement turn tracking (currentPlayer, switchTurn)
- [x] 3.4 Add player management (player colors, names, connection status)
- [x] 3.5 Implement move history tracking (appendMove, getHistory)
- [x] 3.6 Add win condition detection (checkWinner method)
- [x] 3.7 Implement state serialization for Socket.io transmission
- [x] 3.8 Add game room ID generation and tracking

## 4. Server: Player Actions Module

- [x] 4.1 Create src/server/game/player-actions.js with move validation functions
- [x] 4.2 Implement validateMove(gameState, player, row, col) with all validation rules
- [x] 4.3 Implement applyMove(gameState, player, row, col) for atom placement
- [x] 4.4 Add error response generation for invalid moves (Spanish messages)
- [x] 4.5 Integrate move application with chain reaction triggering

## 5. Server: Chain Reactions Module

- [x] 5.1 Create src/server/game/chain-reactions.js with explosion resolution functions
- [x] 5.2 Implement detectExplosions(board) to find cells at critical mass
- [x] 5.3 Implement resolveExplosion(board, row, col, player) for single explosion
- [x] 5.4 Implement resolveCascade(board, player) iterative cascade resolution
- [x] 5.5 Add cascade depth limiting (max 100 explosions)
- [x] 5.6 Generate animation sequence array for client consumption
- [x] 5.7 Add deterministic explosion ordering (BFS or queue-based)

## 6. Server: Game Engine Integration

- [x] 6.1 Create src/server/game/game-engine.js as facade for game logic
- [x] 6.2 Implement createGame(roomId, boardSize, players) function
- [x] 6.3 Implement processMove(gameId, player, row, col) orchestration function
- [x] 6.4 Add game storage (in-memory Map of gameId -> GameState)
- [x] 6.5 Implement getGameState(gameId) accessor
- [x] 6.6 Add game cleanup on end or timeout (30 min idle)
- [x] 6.7 Implement connection recovery (state resend on reconnect)

## 7. Server: Socket Handler Integration

- [x] 7.1 Add game event handlers to src/server/socket-handler.js
- [x] 7.2 Implement "client:game:start" handler with room creation
- [x] 7.3 Implement "client:game:move" handler with validation and broadcast
- [x] 7.4 Implement game room management (join, leave, cleanup)
- [x] 7.5 Add "server:game:started" broadcast on game creation
- [x] 7.6 Add "server:game:stateUpdate" broadcast after moves
- [x] 7.7 Add "server:game:ended" broadcast on win condition
- [x] 7.8 Implement error event emissions (error:game:invalidMove, error:game:notYourTurn, error:game:notActive)
- [x] 7.9 Add disconnect handling (pause game, forfeit after 30s)

## 8. Client: HTML Structure

- [x] 8.1 Add game container div to src/client/index.html after connection status
- [x] 8.2 Add player indicators section (player 1, player 2 with colors)
- [x] 8.3 Add turn indicator with ARIA live region
- [x] 8.4 Add game controls section (Nueva Partida, Reiniciar buttons)
- [x] 8.5 Add game notification area with ARIA live region (assertive)
- [x] 8.6 Add board container div (#game-board) for dynamic rendering
- [x] 8.7 Ensure all interactive elements have aria-labels in Spanish

## 9. Client: CSS Styling

- [x] 9.1 Add game board CSS Grid layout to src/client/css/custom.css
- [x] 9.2 Add cell styling (borders, colors, hover states, focus indicators)
- [x] 9.3 Add player color variables (blue #007bff, orange #fd7e14)
- [x] 9.4 Add atom visualization styles (circles, positioning)
- [x] 9.5 Add animation keyframes for explosions (scale, fade effects)
- [x] 9.6 Add animation keyframes for atom distribution
- [x] 9.7 Add responsive media queries (mobile < 768px, desktop >= 992px)
- [x] 9.8 Add prefers-reduced-motion media query for simplified animations
- [x] 9.9 Add player indicator highlighting styles for current turn
- [x] 9.10 Add win/lose notification modal or banner styles

## 10. Client: Game State Manager

- [x] 10.1 Create src/client/js/game/game-state-manager.js as ES6 module
- [x] 10.2 Implement local shadow state for optimistic updates
- [x] 10.3 Add applyOptimisticMove(row, col) method
- [x] 10.4 Add revertOptimisticMove() method on server rejection
- [x] 10.5 Add updateFromServer(serverState) to sync authoritative state
- [x] 10.6 Implement state change listeners for UI updates

## 11. Client: Game Board Module

- [x] 11.1 Create src/client/js/game/game-board.js as ES6 module
- [x] 11.2 Implement renderBoard(boardSize) to create cell grid with CSS Grid
- [x] 11.3 Implement renderCell(row, col, cellState) with proper ARIA labels
- [x] 11.4 Add cell click handlers with move validation and socket emission
- [x] 11.5 Implement keyboard navigation (Tab, Enter, Space, Arrow keys)
- [x] 11.6 Add updateCell(row, col, player, atoms) for visual updates
- [x] 11.7 Implement atom count visualization (1-4 circles/dots)
- [x] 11.8 Add cell owner color application (borders/backgrounds)

## 12. Client: Animation System

- [x] 12.1 Create src/client/js/game/animation-queue.js as ES6 module
- [x] 12.2 Implement animation queue (FIFO) for explosion sequence
- [x] 12.3 Add queueExplosion(row, col) method with CSS class manipulation
- [x] 12.4 Implement processQueue() with setTimeout delays (300ms default)
- [x] 12.5 Add animateExplosion(row, col) with scale/fade effects
- [x] 12.6 Add animateAtomDistribution(fromRow, fromCol, toRow, toCol)
- [x] 12.7 Check prefers-reduced-motion and skip/simplify animations accordingly
- [x] 12.8 Add animation completion callbacks for state synchronization

## 13. Client: Game UI Module

- [x] 13.1 Create src/client/js/game/game-ui.js as main game controller
- [x] 13.2 Import and initialize game-state-manager, game-board, animation-queue
- [x] 13.3 Import socket-client and register game event handlers
- [x] 13.4 Implement "server:game:started" handler to initialize UI
- [x] 13.5 Implement "server:game:stateUpdate" handler with animation coordination
- [x] 13.6 Implement "server:game:ended" handler with win/lose display
- [x] 13.7 Implement "error:game:*" handlers with Spanish error messages
- [x] 13.8 Add updateTurnIndicator(currentPlayer) with ARIA announcement
- [x] 13.9 Add updatePlayerIndicators(players) with connection status
- [x] 13.10 Implement "Nueva Partida" button handler (emit client:game:start)
- [x] 13.11 Implement "Reiniciar" button handler with confirmation modal
- [x] 13.12 Add game notification display (win/lose/error messages)

## 14. Client: Main Integration

- [x] 14.1 Update src/client/js/main.js to import and initialize game-ui module
- [x] 14.2 Add conditional game initialization based on connection state
- [x] 14.3 Ensure socket-client instance is shared between connection and game modules

## 15. Testing: Server Unit Tests

- [x] 15.1 Create tests/unit/server/game/game-board.test.js
- [x] 15.2 Test board initialization (default 6x6, custom sizes, validation)
- [x] 15.3 Test getAdjacentCells for corner, edge, center positions
- [x] 15.4 Test getCriticalMass returns correct values by position
- [x] 15.5 Create tests/unit/server/game/game-state.test.js
- [x] 15.6 Test state machine transitions (SETUP -> ACTIVE -> ENDED)
- [x] 15.7 Test turn tracking and player switching
- [x] 15.8 Test win condition detection (one player remaining, forfeit)
- [x] 15.9 Create tests/unit/server/game/player-actions.test.js
- [x] 15.10 Test move validation (valid moves, owned cells, out of turn, invalid cells)
- [x] 15.11 Test applyMove updates cell state correctly
- [x] 15.12 Create tests/unit/server/game/chain-reactions.test.js
- [x] 15.13 Test explosion detection at critical mass
- [x] 15.14 Test atom distribution to adjacent cells with ownership change
- [x] 15.15 Test cascade resolution with multiple explosions
- [x] 15.16 Test cascade depth limiting (max 100 explosions)
- [x] 15.17 Create tests/unit/server/game/game-engine.test.js
- [x] 15.18 Test game creation and room management
- [x] 15.19 Test processMove orchestration (validation -> apply -> cascade -> broadcast)

## 16. Testing: Client Unit Tests

- [x] 16.1 Create tests/unit/client/game-state-manager.test.js (if using jsdom)
- [x] 16.2 Test optimistic updates and rollback
- [x] 16.3 Test state synchronization from server
- [x] 16.4 Create tests/unit/client/animation-queue.test.js
- [x] 16.5 Test animation queueing and sequential processing

## 17. Testing: E2E Tests

- [x] 17.1 Create tests/e2e/game-flow.spec.js with Playwright
- [x] 17.2 Test game initialization (board renders, players assigned)
- [x] 17.3 Test placing atoms on empty cells
- [x] 17.4 Test placing atoms on owned cells (increment)
- [x] 17.5 Test invalid move rejection (opponent's cell, out of turn)
- [x] 17.6 Test turn alternation after valid moves
- [x] 17.7 Test chain reaction triggering (corner at 2, edge at 3, center at 4)
- [ ] 17.8 Test multi-step cascade explosions (ver "Known E2E Limitations" en README.md)
- [ ] 17.9 Test win condition (opponent has no atoms) (ver "Known E2E Limitations" en README.md)
- [x] 17.10 Test game controls (Nueva Partida, Reiniciar)
- [x] 17.11 Create tests/e2e/game-accessibility.spec.js
- [x] 17.12 Test keyboard navigation through cells
- [x] 17.13 Test ARIA labels on cells (fila X columna Y, N átomos, Jugador N)
- [x] 17.14 Test ARIA live region announcements (turn changes, game end)
- [x] 17.15 Test focus indicators on cells and controls
- [x] 17.16 Run axe accessibility validation on game UI
- [x] 17.17 Create tests/e2e/game-responsive.spec.js
- [x] 17.18 Test mobile layout (viewport 375x667)
- [x] 17.19 Test tablet layout (viewport 768x1024)
- [x] 17.20 Test desktop layout (viewport 1280x800)
- [x] 17.21 Test touch target sizes on mobile (min 44x44px)

## 18. Integration & Validation

- [x] 18.1 Run npm run lint and fix all linting issues
- [x] 18.2 Run npm test and ensure all unit tests pass
- [x] 18.3 Run npm run test:e2e and ensure all E2E tests pass
- [x] 18.4 Test two-player game locally (open two browser windows)
- [x] 18.5 Test game with different board sizes (4x4, 6x6, 8x8, 10x10)
- [x] 18.6 Test chain reaction animations are smooth and understandable
- [x] 18.7 Test with prefers-reduced-motion enabled (simplified animations)
- [x] 18.8 Test keyboard-only navigation through complete game
- [ ] 18.9 Test with screen reader (NVDA or VoiceOver) - verify ARIA announcements
- [x] 18.10 Test connection recovery (refresh during game, disconnect/reconnect)
- [x] 18.11 Test forfeit on long disconnect (>30s)
- [x] 18.12 Verify Spanish language used consistently in all UI text
- [x] 18.13 Test on mobile device (real device or emulator)
- [x] 18.14 Verify no console errors or warnings in browser
- [x] 18.15 Update README.md with game rules and how to play

## 19. Documentation

- [x] 19.1 Add JSDoc comments to all server game modules
- [x] 19.2 Add JSDoc comments to all client game modules
- [x] 19.3 Document game constants and configuration options
- [x] 19.4 Add inline comments for complex chain reaction logic
- [x] 19.5 Update README with "How to Play" section in Spanish
- [x] 19.6 Document Socket.io game events in README or separate doc
- [x] 19.7 Add troubleshooting section for common issues
