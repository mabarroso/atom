## Context

The current chain-reaction implementation explodes a cell by clearing it and distributing atoms to adjacent cells. The requested behavior changes this mechanic: an exploding cell must distribute one atom per adjacent cell and keep any overflow atoms. In parallel, the UI must represent large counts compactly by showing a 3-atom pattern plus the numeric total for counts greater than 4.

This is a cross-cutting change that touches server game logic and client rendering, and must preserve deterministic cascades and existing ownership conversion semantics.

Constraints:
- No protocol/dependency expansion unless required.
- Keep behavior unchanged for counts 0..4 and existing move validation rules.
- Preserve deterministic queue-based cascade ordering.

## Goals / Non-Goals

**Goals:**
- Implement overflow-preserving explosions for corner, edge, and center cells.
- Keep one-atom-per-adjacent-cell redistribution and ownership conversion to the exploding player.
- Ensure cascades remain deterministic and terminate under existing safeguards.
- Render cells with more than 4 atoms as a stable 3-atom layout plus total count.

**Non-Goals:**
- No change to board size limits, turn order, scoring, or machine decision heuristics.
- No redesign of existing 1..4 atom visual layouts.
- No new visual theme, animation model, or new external libraries.

## Decisions

1. Explosion resolution keeps overflow in source cell using `remaining = atoms - neighbors.length`.
   - Rationale: this directly models “place one atom per adjacent cell and keep extra atoms.”
   - Alternative considered: repeated immediate re-explosion loop in the same cell until under threshold. Rejected because it changes cascade timing semantics and increases complexity.

2. A cell is enqueued for explosion when its atom count is greater than or equal to critical mass.
   - Rationale: with retained overflow, cells can stay above threshold and must continue participating in cascade processing deterministically.
   - Alternative considered: enqueue only on exact threshold crossing. Rejected because it can miss required follow-up explosions after overflow retention.

3. Ownership of the exploding cell is retained after overflow application.
   - Rationale: remaining atoms in the source cell belong to the exploding player by rule consistency.
   - Alternative considered: clear owner when remaining reaches 0 only. Accepted as a conditional post-step (`player = null` when atoms = 0) to keep cell invariants valid.

4. UI rendering for atom counts `> 4` reuses the existing 3-atom geometry and overlays/places the numeric total in the remaining slot.
   - Rationale: satisfies the requirement with minimal layout churn and keeps visual consistency.
   - Alternative considered: render all atoms as text only. Rejected because it removes spatial ownership cues.

5. Keep server payload shape unchanged, relying on existing numeric `atoms` values.
   - Rationale: avoids socket contract churn; only value evolution changes.
   - Alternative considered: add explicit `overflow` field. Rejected as redundant derivation.

6. Numeric totals for cells with atom counts `> 4` are always shown as the raw atom count value.
   - Rationale: preserves exact game-state readability and avoids ambiguity for high-count cells.
   - Alternative considered: truncation/capping on small screens. Rejected because it hides authoritative count information.

7. Animation events must render retained overflow in the source cell immediately after each explosion step.
   - Rationale: keeps visual feedback aligned with step-by-step server resolution semantics.
   - Alternative considered: apply retained overflow only after a full cascade tick. Rejected because intermediate visuals can diverge from actual state transitions.

## Risks / Trade-offs

- [Risk] Retained overflow can increase cascade length and event volume on dense boards. → Mitigation: keep current cascade depth guard and verify performance tests for worst-case scenarios.
- [Risk] UI for large counts may clip on very small cells. → Mitigation: preserve responsive font scaling and assert visibility in mobile/responsive E2E coverage.
- [Trade-off] Showing only 3 atoms for large counts sacrifices exact visual density. → Mitigation: always display the exact numeric total in the same cell.

## Migration Plan

- Implement server logic change in the chain-reaction resolver and update/add focused unit tests for overflow behavior.
- Update client atom-render mapping for `>4` counts and add UI/unit assertions for the 3-atoms-plus-total representation.
- Run unit + integration + relevant E2E suites for reaction and rendering flows.
- Rollback strategy: restore previous explosion reset behavior and prior >4 rendering branch if regressions appear.

## Open Questions

- None.