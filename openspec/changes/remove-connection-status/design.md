## Context

The current client layout includes a dedicated "Estado de conexión" box and a manual "Solicitar estado" button. These elements are not part of the core gameplay loop (create/join game, make moves, view turn/round), and they consume space in the main status area.

This change is limited to client-facing UX and associated wiring:
- HTML structure for status/controls presentation
- Client event bindings for manual status request
- Related tests/spec assertions that currently require the removed elements

Constraints:
- Keep existing gameplay behavior and socket room flow unchanged.
- Avoid protocol or dependency changes.
- Preserve accessibility and Spanish-language consistency in the remaining UI.

## Goals / Non-Goals

**Goals:**
- Remove the "Estado de conexión" UI box from the page.
- Remove the "Solicitar estado" button from controls.
- Keep the rest of game setup and game status UI intact.
- Keep server/client socket runtime stable after removing unused manual status-request trigger from UI.

**Non-Goals:**
- No redesign of other control groups.
- No change to core game rules, turns, timing, or machine behavior.
- No mandatory removal of backend status broadcast internals if they are still used elsewhere.

## Decisions

1. Remove the connection status panel and request button from markup and UI bindings.
   - Rationale: direct fulfillment of requested UX simplification with minimal risk.
   - Alternative considered: hide via CSS only. Rejected because hidden controls still add dead DOM and maintenance cost.

2. Preserve socket connectivity behavior but decouple it from visible status widgets.
   - Rationale: avoids touching stable transport flow while removing only the user-facing controls.
   - Alternative considered: remove all status events server/client side. Rejected as unnecessary for this scope and potentially cross-cutting.

3. Update tests and specs to assert absence of removed controls and intact primary gameplay controls.
   - Rationale: prevents regressions where removed UI accidentally returns and ensures no collateral breakage.
   - Alternative considered: skip test updates. Rejected because existing assertions may still depend on removed elements.

## Risks / Trade-offs

- [Risk] Some tests may implicitly rely on removed selectors. → Mitigation: update affected unit/E2E tests to validate new minimal status area.
- [Risk] Removing button wiring could leave orphan listeners/imports. → Mitigation: clean related handlers and run lint.
- [Trade-off] Runtime connection state is less visible to users. → Mitigation: keep existing connection handling behavior unchanged and rely on core game notices.

## Migration Plan

1. Update client markup and remove connection status box + request button.
2. Remove client-side DOM references and event handlers tied to removed controls.
3. Run and update focused tests (UI/game-flow/accessibility) for the simplified status area.
4. Rollback strategy: restore removed markup and bindings from prior commit if regressions appear.

## Open Questions

- None.
