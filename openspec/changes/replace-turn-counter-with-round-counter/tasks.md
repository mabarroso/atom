## 1. Server progression semantics

- [x] 1.1 Add `roundNumber` as authoritative progression field in server game state with initial value 1
- [x] 1.2 Define and implement round increment rule at valid round boundary (after valid Player 2 move returning turn to Player 1)
- [x] 1.3 Ensure invalid/rejected moves never change `roundNumber`
- [x] 1.4 Include `roundNumber` in all relevant serialized state snapshots and socket `stateUpdate` payloads

## 2. Client state and UI replacement

- [x] 2.1 Update client state manager to consume and preserve `roundNumber` from server snapshots
- [x] 2.2 Replace visible turn-number label/value with round-number label/value in gameplay status area
- [x] 2.3 Keep current-player turn indicator behavior unchanged while progression value shows rounds
- [x] 2.4 Ensure new-game/reset flow restores round display to round 1

## 3. Reconnect and compatibility handling

- [x] 3.1 Ensure reconnect/resync paths render the latest authoritative `roundNumber`
- [x] 3.2 Add compatibility handling for legacy turn-oriented fields only if required during migration
- [x] 3.3 Remove temporary compatibility mapping once all touched consumers use round semantics

## 4. Tests

- [x] 4.1 Add/adjust server unit tests for round initialization, valid round increment, and invalid-move no-change behavior
- [x] 4.2 Add/adjust client unit tests for round value synchronization and status rendering
- [x] 4.3 Add/adjust E2E tests for visible round progression in player-vs-player flow
- [x] 4.4 Add/adjust E2E tests for visible round progression in machine mode and reconnection flow

## 5. Validation and docs

- [x] 5.1 Run lint and targeted unit/E2E suites for all touched areas and resolve regressions
- [x] 5.2 Update documentation/spec references if visible labels or payload semantics changed
