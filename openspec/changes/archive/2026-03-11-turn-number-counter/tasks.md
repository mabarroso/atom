## 1. Server turn-number state

- [x] 1.1 Add authoritative turnNumber field to server game state with a single defined initial value at game start
- [x] 1.2 Increment turnNumber only when a valid move is applied and turn progression occurs
- [x] 1.3 Ensure invalid/rejected moves do not modify turnNumber
- [x] 1.4 Include turnNumber in all relevant server state serialization and stateUpdate payloads

## 2. Client state and UI rendering

- [x] 2.1 Extend client game-state manager to store and refresh turnNumber from server snapshots
- [x] 2.2 Render visible turn-number counter in the existing gameplay status/turn indicator area
- [x] 2.3 Update reset/new-game flows so turnNumber display returns to the defined initial state
- [x] 2.4 Verify turnNumber display updates correctly in both player-vs-player and player-vs-machine flows

## 3. Reconnect and synchronization behavior

- [x] 3.1 Ensure reconnect/resync paths restore current turnNumber from latest authoritative state snapshot
- [x] 3.2 Prevent stale local values from overriding server-provided turnNumber after reconnect

## 4. Test coverage

- [x] 4.1 Add/adjust server unit tests for turnNumber initialization, valid increment, and invalid-move no-change behavior
- [x] 4.2 Add/adjust client unit tests for turnNumber state handling and UI rendering updates
- [x] 4.3 Add/adjust E2E tests to verify visible turn progression in player-vs-player mode
- [x] 4.4 Add/adjust E2E tests to verify visible turn progression in machine mode and after reconnection/resync

## 5. Validation and documentation

- [x] 5.1 Run lint and targeted unit/E2E suites for touched areas and resolve regressions
- [x] 5.2 Update README only if UI behavior or test execution guidance changes
