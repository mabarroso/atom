## Context

Machine moves are authoritative server actions, but the UI can momentarily show stale cell visuals when machine move indications are applied outside the same state-refresh cycle that updates board data. The issue is primarily in client rendering sequencing, not game rules.

This change is intentionally narrow:
- Ensure the board redraw path executes immediately from authoritative machine-move state updates.
- Ensure the impacted machine-move cell visibly reflects owner/atom changes in the same cycle.

Constraints:
- No changes to machine decision logic.
- No changes to socket event names or payload schema.
- No new dependencies.

## Goals / Non-Goals

**Goals:**
- Redraw machine-move-affected cell immediately after authoritative machine move state is received.
- Keep cell visuals (owner color/atom count/last move indication) consistent with authoritative state.
- Preserve existing event flow and animation queue ordering.

**Non-Goals:**
- No gameplay rule changes (critical mass, turns, winner logic).
- No redesign of animations or timing behavior.
- No protocol-level changes to machine move/state update events.

## Decisions

1. Use authoritative `server:game:stateUpdate` board snapshots as the trigger for redraw, not `server:game:machineMove` alone.
   - Rationale: `machineMove` indicates origin/intent but authoritative owner/atom values come from state snapshots.
   - Alternative considered: direct cell patch on `machineMove`. Rejected because it duplicates state logic and risks divergence.

2. Keep machine-move visual effect (`flashTransfer`) but decouple correctness from the effect.
   - Rationale: visual cue should be additive; redraw correctness must be guaranteed by state application.
   - Alternative considered: remove `machineMove` visual effect. Rejected because it reduces UX feedback.

3. Preserve existing queue semantics and reconcile final authoritative state on idle.
   - Rationale: avoids regressions in chain-reaction rendering and keeps machine updates coherent with existing flow.
   - Alternative considered: special-case machine moves in a separate render path. Rejected due to complexity and inconsistency risk.

## Risks / Trade-offs

- [Risk] Redrawing in the same cycle may race with transient visual classes and make assertions flaky in fast browsers. → Mitigation: make tests assert authoritative state visibility with polling-based checks.
- [Trade-off] Keeping both `stateUpdate` redraw and `machineMove` flash may briefly overlap effects. → Mitigation: prioritize state-render correctness and keep effect timing lightweight.
- [Risk] Existing machine-mode E2E timing flakiness may mask regressions. → Mitigation: add focused machine-move redraw test with deterministic setup and robust waits.

## Migration Plan

- Adjust client machine-move handling to ensure authoritative state redraw is the source of truth for cell updates.
- Keep `machineMove` event for visual cue only.
- Add/update tests for machine-move cell redraw correctness.
- Validate with targeted machine-mode E2E and relevant client unit tests.
- Rollback strategy: revert client event sequencing changes while preserving existing socket contracts.

## Open Questions

- None.
