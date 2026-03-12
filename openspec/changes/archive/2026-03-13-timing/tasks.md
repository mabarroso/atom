## 1. Authoritative timing model

- [x] 1.1 Add authoritative match timing fields to server game state (animation delay and machine response delay)
- [x] 1.2 Define timing bounds/defaults and allow `0 ms` only for machine response delay
- [x] 1.3 Include timing fields in all relevant server state snapshots and socket state updates

## 2. Server timing behavior

- [x] 2.1 Update chain-reaction event sequencing to use configured animation delay for newly generated sequences
- [x] 2.2 Update machine move scheduling to use configured machine response delay, including `0 ms`
- [x] 2.3 Ensure timing updates apply to subsequent queued work without mutating already scheduled steps

## 3. Client timing controls UI

- [x] 3.1 Add a game control for animation speed with accessible label and bounded values
- [x] 3.2 Add a game control for machine response time with accessible label, bounded values, and explicit `0 ms` support
- [x] 3.3 Display current authoritative timing values in controls and keep control rendering responsive/accessibility compliant

## 4. Client synchronization and playback

- [x] 4.1 Wire timing control changes to client-server events so accepted changes propagate to all connected clients
- [x] 4.2 Update animation queue usage to consume synchronized animation delay settings while preserving reduced-motion override
- [x] 4.3 Ensure reconnect/state refresh restores timing controls and active values from authoritative state

## 5. Automated tests

- [x] 5.1 Add/update server unit tests for timing defaults, bounds, and `0 ms` machine delay behavior
- [x] 5.2 Add/update server/integration tests to verify synchronized timing values and timing-driven scheduling behavior
- [x] 5.3 Add/update client unit tests for timing control rendering, value propagation, and animation delay handling
- [x] 5.4 Add/update E2E tests validating timing controls affect gameplay pacing and preserve functionality at `0 ms`

## 6. Verification and documentation

- [x] 6.1 Run lint and targeted unit suites for all touched modules
- [x] 6.2 Run relevant integration and E2E suites for timing synchronization, animation speed, and machine response time
- [x] 6.3 Update documentation/spec references if control labels, defaults, or behavior details changed
