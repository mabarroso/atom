## Context

Turn control currently depends on the same server pipeline that applies moves and resolves cascades. If handoff timing is not strictly bound to cascade completion, clients can observe early turn transitions and may attempt additional moves while explosions are still pending.

This change is cross-cutting across:
- Chain reaction completion detection
- Move validation/permission gating
- Turn handoff and machine auto-turn scheduling

Constraints:
- Preserve existing socket contract and event names.
- Preserve deterministic cascade order.
- Do not change gameplay rules beyond turn/move gating timing.
- No new dependencies.

## Goals / Non-Goals

**Goals:**
- Ensure turn changes only after all pending explosions are resolved.
- Ensure move attempts are rejected while cascade resolution is still in progress.
- Ensure machine auto-turn is delayed until prior cascade completion.
- Keep round-number progression aligned with finalized turn handoff.

**Non-Goals:**
- No UI redesign of animation effects.
- No protocol-level event/payload schema changes.
- No changes to critical-mass thresholds, ownership rules, or win condition semantics.

## Decisions

1. Introduce explicit cascade-completion gating at the authoritative server move-processing boundary.
   - Rationale: turn handoff and move permissions must be driven by a single authoritative completion condition.
   - Alternative considered: infer completion from client animation callbacks. Rejected because it is non-authoritative and network-latency dependent.

2. Treat pending-explosion state as a temporary turn lock for both human and machine scheduling.
   - Rationale: avoids overlapping move windows and race conditions while cascade steps remain unresolved.
   - Alternative considered: allow next player optimistic input queued during pending explosions. Rejected due to rule ambiguity and rollback complexity.

3. Keep move rejection behavior during pending explosions within existing validation/error channels.
   - Rationale: preserves socket contract while enforcing stricter timing semantics.
   - Alternative considered: add new dedicated error event for pending explosions. Rejected to avoid unnecessary protocol expansion.

4. Compute machine scheduling delay using max(cascade completion window, machine response delay).
   - Rationale: machine auto-turn must not execute before cascade resolution is complete, even when machine delay is zero.
   - Alternative considered: fixed extra guard delay. Rejected because it is brittle and can be too short/too long depending on cascade length.

## Risks / Trade-offs

- [Risk] Additional gating may increase perceived wait time in long cascades. → Mitigation: keep deterministic, bounded cascade processing and preserve configured pacing semantics.
- [Risk] Tight timing assertions in tests can be flaky across browsers. → Mitigation: use polling and state-based assertions instead of transient class timing checks.
- [Trade-off] Reusing existing error channels may provide less explicit pending-explosion diagnostics. → Mitigation: ensure message text and tests clearly document rejection reason.

## Migration Plan

- Add/confirm authoritative pending-explosion completion checks in cascade processing.
- Gate turn switch and machine scheduling on cascade completion.
- Gate move validation to reject moves during unresolved cascade windows.
- Update unit/integration/E2E tests for turn lock, rejection during pending explosions, and post-cascade release.
- Rollback strategy: revert gating changes while preserving event contracts.

## Open Questions

- None.
