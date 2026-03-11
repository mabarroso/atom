## Context

The game currently communicates turn ownership (active player) but not explicit turn index. Players can lose match progression context during longer matches, after reconnecting, or while observing machine-mode pacing. The feature requires displaying a turn number in the existing game UI without changing move validation, chain-reaction behavior, or game rules.

Constraints:
- The server remains the authoritative source of gameplay state.
- Existing socket update flow (`server:game:stateUpdate`) should continue to drive client rendering.
- The solution must work consistently for player-vs-player and player-vs-machine modes.

## Goals / Non-Goals

**Goals:**
- Expose an authoritative turn number in server state payloads used by clients.
- Display the turn number in the main game status area and keep it synchronized after every state update.
- Define deterministic initialization and progression rules for the counter.
- Preserve correctness during reconnection/resync where a client receives current state mid-match.

**Non-Goals:**
- Changing any game mechanics, move order rules, or win conditions.
- Adding new game modes or timeline/history visualization.
- Introducing external libraries or protocol changes beyond extending the existing state payload.

## Decisions

1. Server-authoritative turn counter in game state
- Decision: Keep `turnNumber` in authoritative server game state and include it in every serialized state update.
- Rationale: Prevents client drift and guarantees reconnection correctness.
- Alternative considered: Client-computed counter from move events. Rejected due to potential desynchronization and reconnect ambiguity.

2. Increment rule tied to applied moves
- Decision: Initialize turn number at game start and increment when a valid move is applied and the game advances to the next turn.
- Rationale: Aligns displayed turn progression with actual gameplay progression and avoids counting rejected actions.
- Alternative considered: Increment on every move attempt. Rejected because invalid attempts should not affect match progression.

3. UI integration in existing status region
- Decision: Render turn number in the current game status UI where turn context is already shown.
- Rationale: Minimal UI surface change and clear visibility on desktop/mobile layouts.
- Alternative considered: Separate panel or overlay. Rejected as unnecessary scope and added responsive complexity.

4. Resync behavior uses latest full snapshot
- Decision: On reconnect/resync, client always renders `turnNumber` from latest `stateUpdate` snapshot.
- Rationale: Stateless client rendering from server snapshots is already established and robust.
- Alternative considered: Persisting local turn number in client storage. Rejected due to stale-data risk.

## Risks / Trade-offs

- [Risk] Off-by-one interpretation (whether opening state is turn 0 or 1) could confuse players or tests.
  → Mitigation: Define a single convention in specs/tests and assert it in server unit tests and E2E flows.

- [Risk] Machine mode performs back-to-back visual updates quickly, making turn transitions harder to observe in E2E.
  → Mitigation: Assert authoritative values from state-driven UI with deterministic waits and existing test helpers.

- [Risk] Minor UI crowding in smaller viewports.
  → Mitigation: Reuse existing status typography/spacing tokens and validate responsive E2E checks.

## Migration Plan

1. Extend server game state to carry/serialize `turnNumber` using a clearly defined start value and increment rule.
2. Ensure socket handlers include the field in all relevant `stateUpdate` emissions.
3. Update client state manager/UI rendering to consume and display the value.
4. Add/adjust unit tests for server and client turn progression and reset/resync behavior.
5. Add/adjust E2E scenarios for player-vs-player and machine mode progression visibility.

Rollback strategy:
- Revert UI binding and state field additions; existing turn-owner display continues to function with no gameplay impact.

## Open Questions

- Should the displayed label be "Turn N" or localized/translated variants, given current UI language strategy?
- Confirm exact initial value convention for a fresh game (turn 1 vs turn 0) before implementation tasks are finalized.
