## 1. Cascade completion and pending-explosion detection

- [x] 1.1 Audit current cascade resolution pipeline to identify where pending explosions can remain after each explosion step
- [x] 1.2 Implement/confirm authoritative pending-explosion verification after each resolved explosion step
- [x] 1.3 Ensure cascade completion is declared only when verification pass confirms no pending explosions

## 2. Turn handoff and move-lock enforcement

- [x] 2.1 Gate turn-switch logic so turn changes only after full cascade completion
- [x] 2.2 Reject move attempts while a prior move's explosions are still resolving, keeping board/turn state unchanged
- [x] 2.3 Preserve existing validation/error channels while enforcing pending-explosion move lock

## 3. Machine auto-turn synchronization

- [x] 3.1 Defer machine turn scheduling until previous move cascade completion is reached
- [x] 3.2 Ensure machine scheduling delay respects max(cascade completion window, machine response delay)
- [x] 3.3 Prevent machine move emission before cascade completion in machine mode

## 4. Automated test coverage

- [x] 4.1 Add/update server unit tests for pending-explosion checks and turn lock behavior
- [x] 4.2 Add/update integration tests for blocked moves during cascade and correct turn release after completion
- [x] 4.3 Add/update E2E tests validating that other player cannot move until all explosions finish

## 5. Verification

- [x] 5.1 Run targeted unit tests for chain-reaction, player-action, and game-state turn flow modules
- [x] 5.2 Run relevant integration/E2E tests covering turn lock and post-cascade turn handoff
- [x] 5.3 Run lint and resolve issues related to this change
