## Context

The game board currently updates atom ownership/count after each move, but it does not explicitly indicate which cell changed most recently. In turn-based play, especially in larger boards and fast machine turns, players must infer the last action by memory. This change introduces persistent visual feedback for the most recent move while preserving existing game rules, turn order, and reaction mechanics.

Relevant constraints:
- Keep implementation within the existing client architecture (`game-state-manager`, `game-board`, `game-ui`).
- Avoid new dependencies; use current CSS and rendering patterns.
- Maintain accessibility and responsive behavior.

## Goals / Non-Goals

**Goals:**
- Persistently highlight exactly one board cell: the one where the latest move was initiated.
- Keep the highlight visible until another valid move is made.
- Ensure behavior is consistent across player-vs-player and player-vs-machine modes.
- Ensure highlight updates are deterministic across local UI rerenders and socket-driven updates.

**Non-Goals:**
- No change to game rules, scoring, turn validation, or reaction resolution.
- No animation redesign or new visual theme system.
- No move history timeline or multi-cell reaction-path highlighting.

## Decisions

1. Track `lastMoveCellId` in client-side game state.
   - Rationale: centralizing this as explicit state avoids deriving last move from diffing board snapshots, which is brittle during chain reactions.
   - Alternative considered: infer from board changes after each render. Rejected due to ambiguity when many cells change in one reaction.

2. Define the highlighted cell as the move origin, not every cell affected by chain reactions.
   - Rationale: the requirement is to identify where the player made their move.
   - Alternative considered: highlight all changed cells. Rejected because it blurs the original action and can produce visual noise.

3. Render highlight through a dedicated CSS class on the board cell container.
   - Rationale: keeps separation of concerns (state in JS, visuals in CSS) and supports responsive/accessibility adjustments without logic changes.
   - Alternative considered: inline styles set from JS. Rejected to preserve maintainability and style consistency.

4. Update the highlight only on successful, accepted moves.
   - Rationale: invalid clicks or rejected moves must not change visual move context.
   - Alternative considered: update on attempted input. Rejected because it can mislead users.

5. Machine turns use the same update path as human turns.
   - Rationale: ensures consistent behavior and avoids mode-specific drift.
   - Alternative considered: separate machine-only handling. Rejected as unnecessary duplication.

## Risks / Trade-offs

- [Risk] Highlight can become stale if a move acknowledgment is dropped or delayed. → Mitigation: update from authoritative game-update events, not optimistic UI attempts.
- [Risk] Highlight style could reduce readability on some screen sizes/themes. → Mitigation: use contrast-safe, minimal emphasis and verify in existing responsive/accessibility tests.
- [Trade-off] Showing only the move-origin cell hides full reaction impact. → Mitigation: keep existing board atom updates as primary reaction visualization while using highlight solely for move origin.

## Migration Plan

- Implement behind current UI behavior with no protocol change required if move origin is already available from existing events.
- If payload lacks explicit origin, derive from the same action message that triggers the move and keep server protocol unchanged unless tests prove ambiguity.
- Rollback strategy: remove `lastMoveCellId` assignment and CSS class binding; board behavior returns to current state without data migration.

## Open Questions

- Should highlight clear immediately at game end or persist until a new game starts?
- Should highlight be suppressed while reactions are still animating, or remain visible continuously?
