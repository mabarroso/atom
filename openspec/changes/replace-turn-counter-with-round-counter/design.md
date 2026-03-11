## Context

The current implementation exposes and renders progression using a turn counter. While technically correct, players interpret game progress primarily by rounds (a full cycle where each side has had an opportunity to act), especially when reviewing match pacing or reconnecting into an active game. The change affects both server-authoritative progression data and client status rendering.

Constraints:
- Server remains the authoritative source of game progression state.
- Existing game mechanics, turn validation, and chain-reaction resolution must remain unchanged.
- The representation must remain consistent across Human vs Human and Human vs Machine modes.
- Reconnect/state resync must always restore the currently authoritative progression value.

## Goals / Non-Goals

**Goals:**
- Replace turn-oriented progression representation with a round-oriented representation in authoritative state and UI.
- Define deterministic round semantics and initialization rules that can be validated in tests.
- Keep client rendering derived from synchronized server snapshots to avoid drift.
- Preserve backward compatibility where practical during migration to avoid broad regressions.

**Non-Goals:**
- Changing turn order, move rules, win conditions, or animation behavior.
- Adding historical timeline views or advanced match analytics.
- Introducing external dependencies or protocol redesign beyond progression field semantics.

## Decisions

1. Authoritative progression uses `roundNumber` in game state
- Decision: Add and maintain `roundNumber` as the canonical progression field in server state snapshots.
- Rationale: Aligns terminology with player mental model and keeps synchronization authoritative.
- Alternative considered: Compute rounds only in UI from existing turn count. Rejected due to reconnect ambiguity and potential client drift.

2. Round semantics derived from turn progression rules
- Decision: Define round 1 at game start and advance rounds according to a single documented formula tied to validated turn progression.
- Rationale: Prevents off-by-one inconsistencies and makes test assertions deterministic.
- Alternative considered: Increment rounds only after Player 2 actions. Rejected because this is mode-dependent and less explicit for machine timing paths.

3. Transitional compatibility for existing consumers
- Decision: During implementation, keep legacy turn field support where already used, while migrating UI/status logic to `roundNumber`.
- Rationale: Reduces risk of regressions in existing handlers/tests and allows incremental refactor.
- Alternative considered: Hard switch removing all turn references in one pass. Rejected as higher-risk and harder to validate incrementally.

4. UI replacement in existing status area
- Decision: Replace the visible progression label in the current gameplay header/status region with round-focused text.
- Rationale: Minimal UX disruption and avoids introducing additional layout complexity.
- Alternative considered: Showing both turn and round simultaneously. Rejected because the request is to replace, not augment.

## Risks / Trade-offs

- [Risk] Round-definition ambiguity (formula and when increments occur) could produce inconsistent server/client behavior.
  → Mitigation: Define exact semantics in specs and assert with server/client/E2E tests.

- [Risk] Partial migration may leave mixed terminology in code/tests.
  → Mitigation: Update touched tests and UI labels in the same change and keep compatibility mapping explicit.

- [Risk] Machine-mode timing could expose incorrect round transitions in E2E.
  → Mitigation: Add deterministic assertions around progression updates after player and machine moves.

## Migration Plan

1. Introduce authoritative `roundNumber` in server game state and serialized snapshots.
2. Update progression update points so round values follow defined semantics in all modes.
3. Replace client status rendering from turn label/value to round label/value.
4. Keep temporary compatibility handling for legacy turn fields if needed during transition.
5. Update unit and E2E tests for progression display, reconnect sync, and machine-mode paths.
6. Remove/limit legacy compatibility only when all consumers are confirmed migrated.

Rollback strategy:
- Revert UI to previous turn counter rendering and restore previous progression field usage in state serialization if regressions are detected.

## Open Questions

- Should `roundNumber` be an integer rounded from turns using a documented formula, or should it be explicitly advanced by dedicated server logic at specific turn boundaries?
- Should machine mode follow identical visible round semantics as PvP (strict parity), or adopt a player-centric interpretation?
- Do we want to preserve `turnNumber` in payloads long-term for compatibility, or remove it after migration is complete?
