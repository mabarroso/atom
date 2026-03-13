## 1. Settings panel UI structure

- [x] 1.1 Add a settings trigger button to the game controls area and add accessible labels
- [x] 1.2 Add a settings panel container with a dedicated close button and keyboard-operable controls
- [x] 1.3 Move the reveal counters button into the settings panel without changing its visibility/permission conditions

## 2. Timing controls and ranges

- [x] 2.1 Place animation speed and machine response controls inside the settings panel for active gameplay
- [x] 2.2 Update animation speed control constraints to min `0`, max `24000`, step `100`
- [x] 2.3 Keep machine response control constraints at min `0`, max `5000`, step `100` within panel placement
- [x] 2.4 Ensure controls display and preserve authoritative synchronized timing values across updates/reconnect

## 3. Server and state validation alignment

- [x] 3.1 Align server/state timing validation constants with the updated animation range and step requirements
- [x] 3.2 Confirm machine response timing validation still enforces `0..5000` with `100` increments
- [x] 3.3 Verify chain-reaction sequence timing metadata uses updated animation range for future sequences

## 4. Test coverage and regression checks

- [x] 4.1 Update/add unit tests for settings panel open/close behavior and control accessibility
- [x] 4.2 Update/add unit tests for reveal counters action from inside settings panel
- [x] 4.3 Update/add unit/integration tests for timing range enforcement (`0..24000` animation, `0..5000` machine, step `100`)
- [x] 4.4 Update/add E2E coverage for grouped configuration flow on desktop and mobile-responsive layouts
- [x] 4.5 Run lint and targeted test suites for changed files and address relevant failures
