## Context

The Atom game infrastructure is complete with Express server, Socket.io real-time communication, Bootstrap client, and testing framework. The application currently displays connection status but has no game functionality. This design implements the core Atom game: a 2-player strategy game where players place atoms on a grid, causing chain reactions when cells reach critical mass.

**Current State:**
- Working Socket.io connection with event naming convention (client:, server:, error:)
- Bootstrap 5 responsive layout with Spanish UI and WCAG 2.2 AA accessibility
- Jest unit tests and Playwright E2E tests configured
- No game state, board, or game logic currently exists

**Constraints:**
- Must maintain existing accessibility standards (keyboard navigation, ARIA labels, screen reader support)
- Spanish language for all UI text
- No build step (vanilla JavaScript ES6 modules)
- Mobile-first responsive design
- Follow existing event naming conventions for Socket.io

## Goals / Non-Goals

**Goals:**
- Implement playable Atom game with complete rules and win conditions
- Support 2-player mode with real-time synchronization via Socket.io
- Visual chain reaction animations that are smooth and understandable
- Mobile and desktop responsive gameplay
- Maintain WCAG 2.2 Level AA accessibility compliance
- Comprehensive test coverage for game logic and user interactions

**Non-Goals:**
- AI opponent for 1-player mode (deferred to future change)
- Persistent game history or user accounts
- Customizable board themes or skins
- Game replay or undo functionality
- Spectator mode or more than 2 players
- Audio effects or sound design

## Decisions

### Decision 1: Server-Authoritative Game State

**Choice:** Game state is managed on the server; clients send move requests and receive state updates.

**Rationale:** Prevents cheating and ensures consistency in multiplayer games. Server validates all moves before applying them. Clients render based on server state updates.

**Alternatives Considered:**
- Client-side state with peer-to-peer sync: Complex to keep in sync, vulnerable to cheating
- Hybrid with client prediction: Adds complexity for a turn-based game with no benefit

**Implementation:** `src/server/game-engine.js` manages game state and logic. Socket.io events follow pattern: `client:game:move` → server validates → `server:game:stateUpdate` broadcast.

### Decision 2: Board as 2D Array of Cell Objects

**Choice:** Represent board as `cells[row][col]` where each cell is `{ player: null|1|2, atoms: 0 }`.

**Rationale:** Simple, efficient lookup for adjacent cells. Explicit row/column indexing makes coordinate calculations clear. Cell objects are minimal but extensible.

**Alternatives Considered:**
- Flat array with index calculation: Less readable, error-prone coordinate math
- HashMap with "row-col" string keys: Slower lookups, awkward iteration

**Implementation:** Board size N stored in game state. Adjacent cells calculated with bounds checking: `(row±1, col±1)`. Critical mass determined by position: corners=2, edges=3, center=4.

### Decision 3: Synchronous Chain Reaction Resolution

**Choice:** Calculate entire chain reaction synchronously on server, send complete animation sequence to clients.

**Rationale:** Guarantees all clients see identical animation. Simpler logic than distributed async resolution. Server computes explosion order, clients animate each step sequentially.

**Alternatives Considered:**
- Async step-by-step with server confirming each explosion: High latency, complex, too many socket messages
- Pure client-side animation after receiving final state: Clients might show different explosion orders

**Implementation:** Server uses BFS/iterative approach to resolve cascades, produces ordered array of explosion events. Client queues animations and plays them with timing delays (e.g., 300ms per explosion).

### Decision 4: Game Rooms with Socket.io Room Mechanism

**Choice:** Use Socket.io rooms to isolate games. Each game has unique room ID. Players join room, server broadcasts state updates only to that room.

**Rationale:** Built-in Socket.io feature, prevents cross-game message leakage. Scales naturally as games are independent.

**Alternatives Considered:**
- Global broadcast with game ID filtering: Inefficient, unnecessary network traffic
- Separate namespaces per game: Overhead of creating many namespaces, harder to manage

**Implementation:** Room ID generated on game creation (UUID or timestamp-based). `socket.join(roomId)` on connection, `io.to(roomId).emit()` for broadcasts. Room cleanup when game ends or both players disconnect.

### Decision 5: CSS Grid for Board Layout

**Choice:** Use CSS Grid with equal row/column sizing for the game board. Cells are styled divs with flexbox for centering atom counts.

**Rationale:** CSS Grid is perfect for uniform grids. Responsive with minimal media queries. Accessible with proper ARIA roles and labels.

**Alternatives Considered:**
- HTML table: More semantic but harder to style and animate
- Absolute positioning: Fragile, not responsive, accessibility issues
- Canvas/WebGL: Overkill for simple 2D grid, accessibility nightmare

**Implementation:** `.game-board { display: grid; grid-template-columns: repeat(N, 1fr); }`. Each cell is a button with `role="button"`, `aria-label="Celda fila X columna Y"`, keyboard accessible. Atom counts rendered as text/SVG circles with player color.

### Decision 6: State Machine for Game Lifecycle

**Choice:** Game state tracked as enum: `SETUP → ACTIVE → ENDED`. Transitions controlled by server events.

**Rationale:** Clear lifecycle prevents invalid state transitions. Easy to enforce rules per state (e.g., moves only valid in ACTIVE state).

**Alternatives Considered:**
- Boolean flags (started, ended): Ambiguous states possible, harder to reason about
- Event sourcing: Overcomplicated for simple turn-based game

**Implementation:** State stored in game object. Server validates state before processing events. Clients render UI based on state (e.g., show "New Game" in SETUP, disable moves in ENDED).

### Decision 7: Optimistic UI Updates with Rollback

**Choice:** Client immediately shows player's move locally, then rolls back if server rejects it.

**Rationale:** Reduces perceived latency. Most moves are valid, so rollback is rare. Feedback is instant for valid moves.

**Alternatives Considered:**
- Wait for server confirmation: Laggy feel, poor UX
- No rollback, assume all moves valid: Confusing when server rejects, desync potential

**Implementation:** Client applies move to local shadow state, shows visual feedback. On `server:game:stateUpdate`, replace shadow state with authoritative state. On `error:game:invalidMove`, show Spanish error message and revert.

### Decision 8: Animation Queue for Chain Reactions

**Choice:** Client maintains FIFO queue of animation steps. Process one step at a time with delays between.

**Rationale:** Ensures animations play in order. Prevents UI from freezing. User can see explosion cascade visually.

**Alternatives Considered:**
- Simultaneous animations: Confusing, can't follow the cascade
- No animation: Boring, unclear what happened

**Implementation:** Server sends array of explosion steps: `[{ row, col, direction, atoms }, ...]`. Client iterates with `setTimeout` or `requestAnimationFrame`, adding CSS classes for explosion effects (e.g., scale/fade atoms).

## Risks / Trade-offs

**[Risk]** Chain reactions with deep cascades could take several seconds to animate → **Mitigation:** Limit max cascade depth (e.g., 50 explosions) or add "skip animation" button. Profile typical game scenarios to set appropriate timeouts.

**[Risk]** Socket.io disconnection during active game loses synchronization → **Mitigation:** Implement connection recovery with state resend. Show "reconectando..." indicator. If player disconnects >30s, other player wins by forfeit.

**[Risk]** Multiple games on server could consume high memory → **Mitigation:** Limit concurrent games per process (e.g., 100). Implement game expiration (auto-end games idle >30 min). Monitor heap usage.

**[Risk]** Accessibility: chain reaction animations might cause issues for screen readers or motion-sensitive users → **Mitigation:** Add `prefers-reduced-motion` media query to skip/simplify animations. Use ARIA live regions to announce major events (explosions, turn changes, winner).

**[Risk]** Mobile touch targets might be too small on large boards → **Mitigation:** Use responsive cell sizing with min-size constraints. Ensure 44x44px minimum touch target per WCAG. Test on real mobile devices with various screen sizes.

**[Risk]** Multi-client E2E scenarios for deep cascade/win-condition validation can be flaky across browsers due to synchronization race conditions → **Mitigation:** Keep affected tests explicitly tracked as pending/fixme and documented as known limitations until a deterministic multi-client harness is implemented.

**[Trade-off]** Server-authoritative state adds latency vs client-side prediction, but gains security and simplicity. Acceptable for turn-based game where 50-200ms latency is imperceptible.

**[Trade-off]** Synchronous chain resolution is simpler but could block event loop briefly on deep cascades. Acceptable since typical cascades are <20 explosions, ~<50ms computation.

## Migration Plan

**Phase 1: Server Game Engine (Non-Breaking)**
- Add `src/server/game-engine.js` and `src/server/game-state.js`
- Register new game event handlers in `src/server/socket-handler.js`
- Add unit tests for game logic
- Deploy: No client changes, backward compatible

**Phase 2: Client UI Components (Feature Flag)**
- Add game board container to `src/client/index.html` (initially hidden)
- Implement `src/client/js/game-board.js` and `src/client/js/game-ui.js`
- Add CSS for board and animations
- Test keyboard navigation and screen reader compatibility
- Deploy with feature flag: show game board only if query param `?game=true`

**Phase 3: Integration & Testing**
- Wire client events to server
- Add E2E tests for complete game flows
- Remove feature flag, show game board by default
- Full deployment

**Rollback Strategy:** If critical bugs found, revert to previous commit. Game engine is additive, so rollback is clean. No database migrations required.

## Open Questions

**Q1:** Should we persist game state to database for recovery after server restart?  
**Recommendation:** No for MVP. Games are short (5-15 min). Accept that server restart ends all active games. Can add persistence in future if needed.

**Q2:** What board size should be default? 6x6, 8x8, or configurable?  
**Recommendation:** Default to 6x6 (original Atom game size). Add configuration in game setup UI for future. Range: 4x4 (quick games) to 10x10 (long games).

**Q3:** How to handle player colors for accessibility? Red/Blue might not work for colorblind users.  
**Recommendation:** Use distinct colors (Blue #007bff, Orange #fd7e14) with additional indicators: Player 1 uses filled circles, Player 2 uses circles with dots/patterns. Add colorblind mode toggle for future.

**Q4:** Should we implement AI for single-player mode now?  
**Recommendation:** No, defer to separate change. Focus on working 2-player game first. AI requires different architecture (minimax/MCTS algorithm, difficulty levels, testing).
