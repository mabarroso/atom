## 1. Server state and synchronization

- [x] 1.1 Add authoritative `atomCountersVisible` flag to game state with default `false`
- [x] 1.2 Compute and serialize Player 1 atoms, Player 2 atoms, and total atoms from authoritative board state
- [x] 1.3 Include visibility flag and counter values in all relevant state snapshots/stateUpdate emissions
- [x] 1.4 Reset `atomCountersVisible` to `false` on new game/restart flows

## 2. Reveal action and permissions

- [x] 2.1 Add server action/event for revealing atom counters
- [x] 2.2 Enforce Player 1-only permission for reveal action using authoritative socket/player assignment
- [x] 2.3 Reject unauthorized reveal attempts and keep visibility state unchanged
- [x] 2.4 Ensure reveal action is idempotent when already visible

## 3. Client UI behavior

- [x] 3.1 Add hidden-by-default atom counter panel in game UI with Player 1, Player 2, and total values
- [x] 3.2 Add Player 1 reveal control and wire it to the new server action
- [x] 3.3 Ensure Player 2 cannot reveal counters through UI behavior
- [x] 3.4 Render visibility and values strictly from authoritative synchronized state

## 4. Reconnect and consistency handling

- [x] 4.1 Ensure reconnect/resync restores correct counter visibility state
- [x] 4.2 Ensure reconnect/resync restores current authoritative counter values
- [x] 4.3 Verify machine-mode and cascade updates keep counter values consistent after reactions

## 5. Test coverage and validation

- [x] 5.1 Add/adjust server unit tests for visibility default/reset, permission gating, and idempotent reveal behavior
- [x] 5.2 Add/adjust client unit tests for hidden/revealed rendering and state-driven counter values
- [x] 5.3 Add/adjust E2E tests for Player 1 reveal success and Player 2 reveal rejection
- [x] 5.4 Add/adjust E2E reconnect tests to verify preserved visibility state and counter values
- [x] 5.5 Run lint and targeted unit/E2E suites for all touched flows and resolve regressions
