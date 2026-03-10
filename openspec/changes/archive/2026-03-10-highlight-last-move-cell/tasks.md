## 1. State and Event Wiring

- [x] 1.1 Add `lastMoveCellId` to client game state shape and initialize/reset it on new game setup.
- [x] 1.2 Update move-application flow to set `lastMoveCellId` only when a move is accepted as valid.
- [x] 1.3 Ensure invalid/rejected move handling keeps the previous `lastMoveCellId` unchanged.
- [x] 1.4 Ensure machine-player accepted moves update `lastMoveCellId` through the same state update path.

## 2. Board Rendering and Visual Highlight

- [x] 2.1 Pass `lastMoveCellId` into board rendering logic and mark exactly one matching cell as last move.
- [x] 2.2 Add/adjust CSS class for last-move highlight on cell container using existing style system tokens/patterns.
- [x] 2.3 Preserve highlight visibility during reaction animation updates until next accepted move replaces it.
- [x] 2.4 Confirm no changes to atom ownership/count rendering, move validation, or game-rule behavior.

## 3. Unit Test Coverage

- [x] 3.1 Add/extend client state-manager unit tests for set/replace/persist behavior of `lastMoveCellId`.
- [x] 3.2 Add unit tests that rejected moves do not modify `lastMoveCellId`.
- [x] 3.3 Add unit tests that machine accepted moves update `lastMoveCellId`.
- [x] 3.4 Add board/UI unit tests verifying only one cell has last-move highlight and highlight switches on next valid move.

## 4. E2E Verification and Quality Checks

- [x] 4.1 Extend E2E game flow test to assert last-move highlight appears after each accepted human move.
- [x] 4.2 Extend machine-mode E2E test to assert highlight updates after machine turns.
- [x] 4.3 Verify highlight persists through reaction sequences until next accepted move.
- [x] 4.4 Run project test suites and lint checks; fix only regressions caused by this change.
