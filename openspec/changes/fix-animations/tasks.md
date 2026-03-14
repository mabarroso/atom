## 1. Authoritative explosion-step ownership updates

- [x] 1.1 Locate and update chain-reaction step application so receiving-cell owner is assigned in the same step as atom increment
- [x] 1.2 Ensure per-step authoritative board snapshots are produced only after owner and atom updates are complete
- [x] 1.3 Verify no gameplay-rule regressions in critical-mass checks, cascade ordering, or winner evaluation

## 2. Client per-step full-board redraw behavior

- [x] 2.1 Update animation-step handling to render the full board from each post-step snapshot before advancing queue
- [x] 2.2 Preserve queue ordering and existing reduced-motion behavior while applying full-board redraw per step
- [x] 2.3 Keep idle reconciliation pass so final authoritative state is re-applied when queue becomes idle

## 3. Socket/state compatibility safeguards

- [x] 3.1 Keep existing socket event names and payload contract unchanged while using post-step snapshots
- [x] 3.2 Confirm reconnect/state refresh still restores authoritative board and ownership values correctly
- [x] 3.3 Validate behavior in both player-vs-player and player-vs-machine modes

## 4. Automated test coverage

- [x] 4.1 Add/update server unit tests for immediate receiving-cell ownership transfer during explosion distribution
- [x] 4.2 Add/update client unit tests for full-board redraw being called for every explosion step in sequence
- [x] 4.3 Add/update integration or E2E tests for visible ownership/color updates and board consistency during multi-step cascades

## 5. Verification

- [x] 5.1 Run targeted unit tests for chain-reaction logic and client animation/render modules
- [x] 5.2 Run relevant integration/E2E tests covering cascade visuals and ownership transfer behavior
- [x] 5.3 Run lint and resolve issues related to this change
