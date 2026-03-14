## 1. Client machine-move redraw sequencing

- [x] 1.1 Audit current `server:game:stateUpdate` and `server:game:machineMove` handlers to identify where machine-move cell redraw can lag
- [x] 1.2 Update game UI flow so authoritative machine-move state triggers immediate board redraw in the same update cycle
- [x] 1.3 Keep `machineMove` visual cue behavior (`flashTransfer`) additive without replacing authoritative redraw

## 2. State and contract compatibility

- [x] 2.1 Ensure no socket event names or payload fields are changed for machine move and state update flow
- [x] 2.2 Verify last-move highlight, owner color, and atom count for machine move remain sourced from authoritative state
- [x] 2.3 Confirm no regressions in chain-reaction queue ordering or idle reconciliation behavior

## 3. Automated test coverage

- [x] 3.1 Add/update client unit tests proving machine-move impacted cell redraws from authoritative state in the same cycle
- [x] 3.2 Add/update E2E coverage for machine-mode flow to validate visible machine-move cell refresh (owner/atoms/last-move)
- [x] 3.3 Stabilize machine-mode assertions with polling-based checks where timing-sensitive visual classes can race

## 4. Verification

- [x] 4.1 Run targeted client unit tests for game UI/board rendering modules
- [x] 4.2 Run targeted machine-mode E2E tests validating machine-move visibility and redraw behavior
- [x] 4.3 Run lint and resolve issues related to this change
