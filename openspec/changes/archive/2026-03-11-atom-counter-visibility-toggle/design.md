## Context

The current game UI does not provide a compact numeric summary of atoms per player and global total. Players infer board pressure by scanning individual cells, which is slow during mid/late game states. The requested behavior introduces a board-level atom counter panel, hidden by default, that becomes visible to everyone only when Player 1 triggers reveal.

This is a cross-cutting change because it touches:
- Server-authoritative game state (visibility flag and synchronization)
- Permission rules for player-triggered actions
- Client rendering and interaction controls
- Reconnection/state-resync consistency

Constraints:
- No gameplay mechanics may change (move validity, turn order, chain reactions, winner logic).
- Counter values must be derived from authoritative board state, not local heuristics.
- Visibility state must be deterministic and shared across all connected clients.

## Goals / Non-Goals

**Goals:**
- Add atom counters for Player 1, Player 2, and total atoms.
- Keep counters hidden by default on new game and restart.
- Allow only Player 1 to reveal counters.
- Broadcast/recover revealed state consistently across all clients and reconnect flows.

**Non-Goals:**
- Adding per-cell historical analytics, graphs, or advanced stats.
- Allowing Player 2 or spectators to toggle reveal state.
- Changing game engine outcomes, timing, or AI decision behavior.

## Decisions

1. Server-authoritative `atomCountersVisible` flag in game state
- Decision: Store `atomCountersVisible` as part of server game state and include it in all full state snapshots.
- Rationale: Prevents client divergence and guarantees reconnect consistency.
- Alternative considered: Local UI-only toggle per client. Rejected because visibility must be shared globally.

2. Counter values computed from current board snapshot
- Decision: Compute Player 1, Player 2, and total atom counts from authoritative board cells whenever state is serialized/emitted.
- Rationale: Ensures values always match actual board after cascades and machine moves.
- Alternative considered: Increment/decrement counters optimistically on events. Rejected due to cascade complexity and drift risk.

3. One-way reveal action gated to Player 1
- Decision: Introduce a dedicated client action/event handled by server; allow only Player 1 assignment to trigger reveal.
- Rationale: Matches requirement and centralizes permission checks server-side.
- Alternative considered: Client-side hidden control check only. Rejected as insecure and bypassable.

4. Reveal state reset on new game/restart
- Decision: Reset `atomCountersVisible` to `false` whenever a game starts/restarts.
- Rationale: Preserves hidden-by-default behavior for each new match context.
- Alternative considered: Persist reveal state across restarts in same room. Rejected because it conflicts with hidden-by-default requirement.

## Risks / Trade-offs

- [Risk] Permission edge cases when reconnecting could allow incorrect reveal attempts.
  → Mitigation: Authorize reveal using current socket assignment and game player slot on server.

- [Risk] Counter rendering could briefly lag if UI updates are not tied to authoritative snapshots.
  → Mitigation: Render counters only from incoming `stateUpdate` snapshots.

- [Risk] Additional payload fields may increase test fragility in existing suites.
  → Mitigation: Update targeted unit/E2E tests and avoid brittle full-object equality assertions.

## Migration Plan

1. Extend server game state model with `atomCountersVisible` default `false` and serialized atom counter values.
2. Add reveal action handler in socket flow with Player 1 authorization and room-wide broadcast of updated state.
3. Add client UI panel for counters and reveal control; hidden by default, visible when state flag is true.
4. Ensure restart/new-game and reconnect pathways preserve/reset visibility as specified.
5. Add/adjust unit tests for permission logic and state serialization; add/adjust E2E for reveal flow and reconnect sync.

Rollback strategy:
- Remove reveal action and counter panel rendering, and stop serializing visibility/counter fields while retaining existing gameplay paths.

## Open Questions

- Should Player 1 be able to reveal counters at any time during ACTIVE state only, or also in SETUP/ENDED?
- Should reveal be strictly one-way (no hide action), or should future scope include hide/reset control during a match?
- Should the reveal control be hidden for Player 2 entirely, or visible but disabled with explanatory message?
