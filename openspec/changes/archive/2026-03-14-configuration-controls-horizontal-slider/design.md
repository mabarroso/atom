## Context

The settings panel currently exposes timing configuration through numeric controls for `Velocidad animación` and `Respuesta máquina`. This change replaces those two controls with horizontal sliders to improve usability and touch interaction, while preserving existing authoritative timing behavior and synchronization.

Scope is intentionally narrow:
- UI control type changes from numeric input to horizontal range slider
- Existing labels, ranges, increments, and update events stay the same
- No gameplay-rule or timing-engine semantic changes

Constraints:
- No new dependencies.
- Keep all user-facing text in Spanish.
- Keep controls accessible (keyboard + pointer, descriptive `aria-label`).
- Preserve synchronized authoritative timing values across connected clients and reconnection.

## Goals / Non-Goals

**Goals:**
- Replace animation speed control with a horizontal slider.
- Replace machine response control with a horizontal slider.
- Keep exact ranges and steps:
  - Animation speed: `0..24000 ms`, step `100`
  - Machine response: `0..5000 ms`, step `100`
- Preserve existing timing update flow and synchronization behavior.

**Non-Goals:**
- No change to timing validation rules beyond what already exists.
- No change to socket event names, payload shape, or server timing logic.
- No redesign of settings panel layout beyond what is necessary for slider controls.

## Decisions

1. Use native horizontal range inputs (`type="range"`) for both timing controls.
   - Rationale: simple, standard, keyboard-accessible, and touch-friendly without dependencies.
   - Alternative considered: custom slider component. Rejected for unnecessary complexity.

2. Keep one independent slider per setting rather than a combined dual-handle control.
   - Rationale: settings are unrelated ranges and already independently synchronized.
   - Alternative considered: dual-handle slider. Rejected because it implies coupled values and more complex UX.

3. Keep displayed value text near each slider, sourced from authoritative state.
   - Rationale: users need immediate numeric feedback for exact milliseconds.
   - Alternative considered: slider without numeric value display. Rejected due to reduced precision clarity.

4. Reuse existing timing-update emission and state-refresh handlers.
   - Rationale: avoids protocol changes and limits risk.
   - Alternative considered: new update channel for slider interactions. Rejected as redundant.

## Risks / Trade-offs

- [Risk] Frequent slider input events may increase timing update traffic while dragging.
  - Mitigation: retain current update strategy and, if needed later, switch to commit-on-change behavior.

- [Risk] Very wide animation range (`0..24000`) can reduce fine control on small screens.
  - Mitigation: keep step at `100` and display exact numeric value.

- [Trade-off] Native sliders vary slightly by browser appearance.
  - Mitigation: accept native rendering for consistency with no extra dependencies.

## Migration Plan

- Update settings panel markup to render both timing controls as horizontal range sliders.
- Ensure each slider keeps existing `min`, `max`, `step`, label, and `aria-label` semantics.
- Reuse existing UI handlers to emit timing updates and render synchronized authoritative values.
- Update unit tests and E2E tests that currently assume numeric input controls.
- Rollback strategy: revert control type to prior numeric input without touching timing logic/events.

## Open Questions

- None.
