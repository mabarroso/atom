## 1. Cell Geometry Foundation

- [x] 1.1 Enforce square board-cell geometry (equal width and height) in the game board styles while preserving minimum touch target constraints.
- [x] 1.2 Verify square-cell behavior across supported board sizes and responsive breakpoints (mobile/tablet/desktop).
- [x] 1.3 Ensure existing hover, focus, owner-color, and last-move highlight states remain visually correct on square cells.

## 2. Atom Layout Rules for 1/2/3 Atoms

- [x] 2.1 Implement deterministic atom layout mapping for exactly 1 atom (centered position).
- [x] 2.2 Implement deterministic atom layout mapping for exactly 2 atoms (top-left to bottom-right diagonal).
- [x] 2.3 Implement deterministic atom layout mapping for exactly 3 atoms (upward equilateral triangle).
- [x] 2.4 Introduce consistent intra-cell spacing and edge-margin variables so atoms remain equidistant and margin-consistent.
- [x] 2.5 Keep current rendering strategy for 4+ atoms unchanged unless required by regression fixes.

## 3. Rendering and Accessibility Integrity

- [x] 3.1 Update board-rendering class assignments/structure to support atom-count layout variants without changing gameplay logic.
- [x] 3.2 Validate that ARIA labels continue to reflect correct atom count and owner state after layout changes.
- [x] 3.3 Validate keyboard interaction (focus/enter/space) is unaffected by the appearance update.

## 4. Test Coverage and Quality Checks

- [x] 4.1 Add or extend unit tests for atom-layout class mapping for 1/2/3 atom scenarios.
- [x] 4.2 Add or extend unit tests verifying only one last-move-highlight cell remains visible with new geometry.
- [x] 4.3 Add or extend E2E tests to assert square-cell rendering and visible layout behavior for 1/2/3 atoms.
- [x] 4.4 Run lint and targeted unit/E2E suites; resolve only regressions introduced by this change.
