## Context

The board currently renders cells and atom dots with a generic layout that does not enforce explicit geometric arrangements for 1/2/3 atoms. This change requires deterministic visual geometry: square cells, centered single atom, diagonal placement for two atoms, and upward equilateral-triangle placement for three atoms, with equidistant spacing and consistent edge margin.

Constraints:
- Keep gameplay logic unchanged (ownership, turn rules, reactions, scoring).
- Keep implementation in existing client modules and styles.
- Do not add external dependencies.
- Preserve accessibility and responsive behavior.

## Goals / Non-Goals

**Goals:**
- Ensure each board cell has equal side lengths across supported viewports/sizes.
- Implement deterministic atom placement geometry for atom counts 1, 2, and 3.
- Keep atom positions equidistant from each other and from cell edges via a consistent margin model.
- Preserve existing interaction states (hover/focus/owned/highlighted) and reduced-motion behavior.

**Non-Goals:**
- No changes to move validation, reaction mechanics, or machine decision rules.
- No redesign of board-level layout beyond what is required to maintain square cells.
- No new animation system or visual effects beyond current styling primitives.

## Decisions

1. Use CSS-driven square cell geometry with fixed aspect enforcement.
   - Decision: enforce a square shape with CSS (`aspect-ratio: 1 / 1`) while preserving current min touch target.
   - Rationale: this is robust across responsive layouts and simpler than JS resizing.
   - Alternative considered: compute square dimensions in JS on resize; rejected due to complexity and reflow overhead.

2. Render atom positions through layout classes keyed by atom count.
   - Decision: assign explicit classes for atom-count layouts (1/2/3) and place atom dots in deterministic slots.
   - Rationale: declarative classes keep render logic simple and make geometry testable.
   - Alternative considered: inline absolute coordinates from JS; rejected to avoid mixing style and logic.

3. Define geometric slots using normalized spacing variables.
   - Decision: represent placement with CSS custom properties (e.g., edge margin and slot offsets) so all counts follow the same spacing model.
   - Rationale: guarantees consistent edge margins and easier tuning across devices.
   - Alternative considered: hardcoded per-count pixel offsets; rejected as brittle in responsive scenarios.

4. Keep 4+ atom behavior compatible with existing rendering.
   - Decision: apply strict geometric rules to 1/2/3 atoms, while preserving current visual strategy for higher counts.
   - Rationale: aligns with requested scope and minimizes regression risk.
   - Alternative considered: redesign all counts at once; rejected as over-scope.

5. Verify geometry via unit and E2E assertions on classes/structure.
   - Decision: test deterministic class assignments and square-cell style behavior rather than pixel-perfect screenshot baselines.
   - Rationale: lower flakiness and cross-browser stability.
   - Alternative considered: visual snapshot testing; rejected due to higher maintenance and noise.

## Risks / Trade-offs

- [Risk] Minor cross-browser differences in sub-pixel rendering can slightly shift perceived spacing. → Mitigation: use relative positioning and tolerance-based assertions in tests.
- [Risk] Enforcing square cells may reduce board density on very small screens. → Mitigation: keep minimum touch targets and preserve responsive gap/board-size constraints.
- [Trade-off] Restricting strict geometry to 1/2/3 atoms leaves higher-count visuals less formalized. → Mitigation: document this intentionally as out-of-scope for this change.

## Migration Plan

- Update client cell CSS and board rendering classes incrementally behind existing render flow.
- Run targeted unit tests for class/layout mapping and focused E2E checks for visible states.
- Rollback strategy: revert atom-layout class mapping and square-cell CSS rule to restore previous rendering.

## Open Questions

- Should the same geometric strictness later be extended to 4 atoms and overflow-count representations?
- Is a dedicated visual-regression snapshot suite desired for future appearance-only changes?
