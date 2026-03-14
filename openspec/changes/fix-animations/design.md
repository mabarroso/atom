## Context

Cascade animation playback can show transiently stale board visuals when only the exploding/target cells are patched per step. In the same path, ownership changes on receiving cells can appear late if rendering uses stale owner values until a later full-state refresh.

This change is cross-cutting between server-side chain-reaction state transitions and client-side animation-step rendering:
- Server logic must ensure ownership is authoritative immediately when adjacent transfer atoms are applied.
- Client logic must redraw the complete board from the authoritative post-step snapshot before queuing the next animation step.

Constraints:
- Keep existing gameplay rules, socket event names, and payload contracts unchanged.
- Keep current cascade ordering semantics and reduced-motion handling.
- Do not add dependencies.

## Goals / Non-Goals

**Goals:**
- Ensure every explosion step produces a full-board redraw from post-step authoritative state.
- Ensure receiving-cell owner changes are applied immediately in authoritative chain-reaction state.
- Ensure visual ownership/color changes are visible in the same redraw cycle as the transfer step.
- Preserve deterministic cascade ordering and existing timing behavior.

**Non-Goals:**
- No change to critical-mass thresholds or win-condition rules.
- No redesign of animation styles/effects beyond render consistency.
- No protocol/schema changes for socket events.

## Decisions

1. Keep server chain-reaction resolution as the single source of truth for ownership updates per transfer step.
   - Rationale: ownership correctness belongs to authoritative state transition logic.
   - Alternative considered: deriving ownership client-side during animation playback. Rejected due to desynchronization risk and duplicated rules.

2. Require each emitted animation step to carry or reference a full post-step board snapshot already consistent with ownership updates.
   - Rationale: client can render exact authoritative state without reconstructing partial diffs.
   - Alternative considered: delta-only patches (changed cells only). Rejected because missing patch coverage can leave stale cells visible.

3. Update client animation queue callback flow to render the full board at every step boundary before moving to the next queued step.
   - Rationale: guarantees all cells are refreshed, including unaffected-looking cells whose ownership/atoms changed indirectly.
   - Alternative considered: selective rerender optimization. Rejected for this fix because correctness is prioritized over micro-optimizations.

4. Keep final authoritative state re-application after queue idle as a safety reconciliation pass.
   - Rationale: preserves current robustness against interrupted/partial animation playback.
   - Alternative considered: removing idle reconciliation. Rejected due to higher drift risk in edge timing scenarios.

## Risks / Trade-offs

- [Risk] Full-board redraw per step may increase client rendering cost on large cascades. → Mitigation: reuse existing board render path and validate responsiveness with current board sizes.
- [Risk] Ownership timing bugs could persist if server sequence generation still computes owner after emitting step snapshot. → Mitigation: enforce owner assignment before snapshot creation and add unit tests for transfer-step ownership.
- [Trade-off] Prioritizing correctness over partial-render optimization may slightly increase per-step work. → Mitigation: keep scope minimal and optimize later only if profiling indicates a real regression.

## Migration Plan

- Update chain-reaction step application to guarantee receiving-cell owner assignment occurs in the same authoritative step as atom increment.
- Ensure generated animation sequence state for each step reflects that immediate ownership update.
- Update client animation-step handler to redraw board from each post-step snapshot before advancing queue.
- Add/adjust unit tests for chain-reaction ownership transfer timing and client per-step full redraw behavior.
- Add/adjust E2E coverage for visible ownership update and board consistency during multi-step cascades.
- Rollback strategy: revert to previous per-step rendering behavior and prior ownership timing logic while preserving existing event contracts.

## Open Questions

- None.
