## Why

Current board cells are functional but can be harder to scan quickly during play, especially when distinguishing interaction states (empty, owned, hover, focus, and emphasized states). Improving cell appearance now increases readability and usability without changing game mechanics.

## What Changes

- Refine visual styling of board cells to improve clarity of ownership and interaction feedback.
- Define clearer visual behavior for key cell states (default, hover, focus, owned, and highlighted states).
- Require square cell geometry (equal width and height) across supported board sizes.
- Define atom layout rules inside each cell:
	- 1 atom: centered in the cell.
	- 2 atoms: diagonal arrangement from top-left to bottom-right.
	- 3 atoms: equilateral triangle arrangement pointing upward.
- Require intra-cell atom spacing to be equidistant, with consistent margin relative to cell edges.
- Keep all gameplay logic unchanged; this is a presentation and accessibility-oriented update.
- Align updated visuals with existing responsive and reduced-motion behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `game-ui`: Update requirements for board cell visual presentation and state-specific appearance rules.

## Impact

- Affected code: client board rendering and stylesheet rules for game cell states and atom placement geometry.
- Affected tests: E2E and unit tests that assert visual state classes, cell aspect ratio, and atom layout positions for 1/2/3 atoms.
- APIs/dependencies: no new external dependencies expected.
