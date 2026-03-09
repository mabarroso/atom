## Context

The Atom game currently requires two human players connected via WebSocket. The project documentation specifies 23 Machine Rules (probabilistic decision scenarios) for an optional AI opponent, but this AI has not been implemented. Adding Machine player support enables single-player mode and improves user engagement.

Current architecture:
- Game engine manages state transitions and move validation
- Client sends `client:game:move` events; server responds with `server:game:stateUpdate`
- Turn alternates after each valid move
- Player 2 is assumed to be human (connected client)

Machine player introduces:
- Server-side move selection (no client event required)
- Automatic turn triggering for AI moves
- Board analysis for decision rule evaluation

## Goals / Non-Goals

**Goals:**
- Implement AI opponent following the documented 23 Machine Rules
- Enable game creation with "Human vs Machine" mode option
- Seamlessly integrate Machine moves into existing game flow
- Maintain game-state consistency for AI-generated moves
- Provide identical validation and chain-reaction resolution for AI moves

**Non-Goals:**
- Machine hints or assistance for human players
- Difficulty levels or adjustable AI behavior (future work)
- Network sync of Machine decision logic (server-side only)
- Analytics or play pattern tracking
- Machine learning or adaptive AI

## Decisions

**Decision 1: Server-side only AI logic**
- **Rationale**: Machine decision logic is deterministic and rule-based, not requiring real-time client communication. Server-side computation ensures consistency, prevents network latency from affecting AI responsiveness, and simplifies client code.
- **Alternative considered**: Client-side AI with server validation → rejected as adds network round-trip per move and complicates sync.

**Decision 2: Dedicated `machine-player.js` module**
- **Rationale**: Separates 23 decision rules into a standalone, testable module. Enables independent testing of AI logic without game-state complexity. Clear interface: `(board, gameState) → cellToPlay`.
- **Alternative considered**: Inline rules in `game-engine.js` → rejected as adds 200+ lines of separate logic to core engine.

**Decision 3: Automatic turn triggering in game engine**
- **Rationale**: After a human player's move completes (chain reactions resolved), check if next player is Machine. If yes, immediately compute and apply Machine move within same event loop. Client sees smooth state update with no visible latency.
- **Alternative considered**: Client polls for Machine move → rejected as introduces network delay and complexity.

**Decision 4: Machine move broadcast to client**
- **Rationale**: When Machine selects a cell, emit `server:game:machineMove` event to client(s) containing: `{cell: {row, col}, atoms: N}`. Client renders animation/highlight to visualize AI action, maintaining engagement.
- **Alternative considered**: Only send final state update → rejected as players can't see reasoning, reduces perceived AI "smartness".

**Decision 5: Game mode selection before game start**
- **Rationale**: On game creation (Player 1 screen), show radio buttons: "vs Human Player" (default) or "vs Machine". If Machine selected, skip Player 2 join step. Store `gameMeta.isHuman[2]` flag.
- **Alternative considered**: Machine join as Player 2 after human player 1 creates room → rejected as confuses game flow (Player 1 won't know if P2 is human or AI).

**Decision 6: Probabilistic rules via random threshold**
- **Rationale**: Each of the 23 rules is evaluated in priority order. For rule N with probability P, generate `Math.random() < P/100`. First rule to succeed executes that move. If no rules succeed (edge case), fall back to `occupies free cell`.
- **Alternative considered**: Weight-based sampling from all rules → rejected as violates documented rule priority order.

**Decision 7: Machine thinking delay**
- **Rationale**: Add a 2-second delay before executing Machine move to simulate human thinking time and improve UX perception. No visible "thinking" message shown to avoid UI clutter. Implemented as `setTimeout()` after move selection, before broadcasting to client.
- **Alternative considered**: Instant execution → rejected as feels too mechanical, reduces engagement.

**Decision 8: Decision rule logging**
- **Rationale**: Log which decision rule was selected by Machine for each move. Includes rule index, probability value, and selected cell coordinates. Enables debugging, analytics, and future optimization. Logged server-side only (not transmitted to client).
- **Alternative considered**: No logging → rejected as makes debugging impossible and prevents understanding AI behavior patterns.

**Decision 9: Difficulty levels support (future-ready)**
- **Rationale**: Design probability structure to support future difficulty levels (Easy/Medium/Hard). Store probabilities in configuration object keyed by difficulty. Current implementation uses "Medium" preset. Architecture supports adding Easy (lower aggression) and Hard (higher aggression) without refactoring core logic.
- **Alternative considered**: Hardcoded probabilities → rejected as requires significant refactor for future difficulty feature.

## Risks / Trade-offs

**[Risk: Incomplete board analysis]** → Mitigation: Machine analyzer must correctly identify corner/edge/center cells, find adjacent cells, detect cells at critical mass, and evaluate opponent adjacency. Unit tests verify all scenarios before game engine integration.

**[Risk: Player 2 joining when Machine is expected]** → Mitigation: Set `gameMeta.machineMode = true` before Room state published. On `client:game:start` from Player 1, validate no Player 2 has joined if Machine mode is active. Emit error if attempting to join Machine game with second client.

**[Risk: Chain reactions during Machine move execution]** → Mitigation: Chain reactionsuse core `player-actions.js` logic unchanged. After Machine places atom, existing explosion resolution handles all cascades. Server buffers all state updates and broadcasts single final state to clients (no mid-cascade updates).

**[Risk: Performance of repeated board analysis]** → Mitigation: Machine logic runs on server (not client). Typical game has ~36 cells (6x6); rule evaluation is O(cells + adjacency checks) = O(1) in practice. Profiling ensures < 10ms per move decision.

**[Trade-off: Deterministic vs truly random]** → Machine behavior is deterministic given board state and random seed. No learning or adaptation between games. Each game plays differently (due to probability), but replaying same sequence of moves produces same AI behavior. Acceptable: simpler to test, debug, and reason about.

## Migration Plan

**Phase 1: Core AI module (non-blocking)**
- Implement `machine-player.js` with all 23 decision rules
- Unit test each rule independently
- No integration yet; won't affect running games

**Phase 2: Game-state integration**
- Add `machineMode` flag to `gameMeta` (default false)
- Add `isHuman[2]` to player metadata (true→human, false→machine)
- Modify game creation endpoint to accept mode parameter
- No behavior change for existing games (all human vs human)

**Phase 3: Engine automatic move execution**
- In game-engine after each valid move + chain resolution, check if `gameMeta.machineMode && !isHuman[2]`
- If true: call `machinePlayer.selectMove(board, gameState)` → apply move
- Broadcast `server:game:machineMove` + `server:game:stateUpdate` to clients
- Existing tests continue to pass (game flow unchanged, just adds Machine branch)

**Phase 4: UI and client display**
- Add game mode selection radio buttons (Human vs Human / vs Machine)
- Listen to `server:game:machineMove` and highlight selected cell with animation
- No breaking changes; existing UI works as-is

**Rollback:** If issues arise, revert `machineMode` to always false (disables Machine globally). All previous human-vs-human games unaffected.
