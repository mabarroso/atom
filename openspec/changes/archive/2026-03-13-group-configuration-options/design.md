## Context

The current UI exposes configuration actions inline with primary gameplay controls, which reduces clarity and makes the control area crowded. This change groups configuration options into a dedicated settings panel opened by a settings button, while preserving all game mechanics and existing authoritative timing behavior.

The panel must include:
- Reveal counters action
- Animation speed control (`0..24000 ms`, `100 ms` increments)
- Machine response control (`0..5000 ms`, `100 ms` increments)
- Close button

Constraints:
- No new dependencies.
- Preserve existing socket/state synchronization model.
- Keep controls accessible and keyboard operable.

## Goals / Non-Goals

**Goals:**
- Introduce a clear settings entry point and panel open/close interaction.
- Group configuration controls together without changing core game flow.
- Enforce the exact timing ranges/steps requested for both controls.
- Keep reveal counters available through the panel.

**Non-Goals:**
- No change to game rules, turn progression, machine decision logic, or scoring.
- No redesign of board rendering/animation effects beyond range validation and control placement.
- No multi-panel/settings-page architecture.

## Decisions

1. Use a single in-page settings panel toggled by a dedicated settings button.
   - Rationale: simplest UX and implementation with minimal layout disruption.
   - Alternative considered: modal dialog. Rejected to avoid extra complexity/focus-trap handling in this scope.

2. Move reveal counters control into the panel and keep existing permission logic (Player 1 authority) unchanged.
   - Rationale: centralizes configuration actions while preserving server-authoritative behavior.
   - Alternative considered: duplicate reveal button in both main controls and panel. Rejected to avoid redundant actions.

3. Implement both timing controls as bounded numeric selectors with explicit min/max/step validation.
   - Rationale: matches required ranges exactly and aligns with existing timing update pathway.
   - Alternative considered: free-form inputs. Rejected due to invalid-value ambiguity and weaker UX.

4. Treat control changes as authoritative updates propagated through existing timing synchronization events.
   - Rationale: keeps all clients in a match consistent and avoids divergent pacing states.
   - Alternative considered: local-only panel state. Rejected for multiplayer incoherence.

5. Keep panel close behavior explicit via dedicated close button (and optional existing UX conventions if already present).
   - Rationale: directly satisfies requirement and improves discoverability.
   - Alternative considered: close only by re-clicking settings button. Rejected because requirement explicitly asks for close button.

## Risks / Trade-offs

- [Risk] Very high animation delay (`24000 ms`) can make game feel stalled. → Mitigation: keep value visible and synchronized; rely on user intent.
- [Risk] Panel open state may conflict with responsive layouts on smaller screens. → Mitigation: use existing responsive utility classes and verify E2E on mobile viewport.
- [Trade-off] Grouping options adds one extra click to reach reveal counters. → Mitigation: cleaner primary controls and better organization for all settings.

## Migration Plan

- Add settings button and panel container to UI structure.
- Relocate reveal counters action into panel.
- Update timing control bounds/steps to requested ranges.
- Wire panel open/close interactions in existing UI controller.
- Reuse existing timing/reveal socket flows and state rendering.
- Add/adjust unit and E2E tests for panel toggle, control ranges, and reveal action from panel.
- Rollback strategy: remove panel, restore controls to prior location and prior range constraints.

## Open Questions

- None.