## 1. Server reaction semantics

- [x] 1.1 Update chain-reaction explosion logic to distribute one atom per adjacent cell and retain overflow in the source cell (`remaining = atoms - adjacentCount`)
- [x] 1.2 Ensure explosion triggering/enqueue checks use at-or-above critical mass (`>=`) for corner, edge, and center cells
- [x] 1.3 Preserve source-cell ownership when overflow remains and clear ownership only when resulting atom count is zero
- [x] 1.4 Keep deterministic queue-based cascade resolution behavior and existing cascade guardrails intact

## 2. Server animation/state emission

- [x] 2.1 Update explosion event generation so each step includes enough data for clients to render immediate post-step overflow in the source cell
- [x] 2.2 Validate event ordering and payload compatibility with current socket synchronization flow (no new dependency/protocol expansion)
- [x] 2.3 Ensure synchronized state snapshots continue exposing authoritative numeric atom counts for all cells

## 3. Client atom rendering for counts greater than 4

- [x] 3.1 Update cell rendering mapping so atom counts greater than 4 use the compact 3-atom layout
- [x] 3.2 Display the raw numeric total value (no truncation/capping) in the remaining display slot for counts greater than 4
- [x] 3.3 Keep existing rendering behavior unchanged for counts 0 through 4 and preserve owner color/accessibility semantics

## 4. Client animation behavior

- [x] 4.1 Update animation queue handling to render retained source-cell overflow immediately after each explosion step
- [x] 4.2 Ensure immediate overflow rendering occurs before the next queued explosion animation step starts
- [x] 4.3 Preserve reduced-motion behavior and existing ordered animation processing guarantees

## 5. Automated tests

- [x] 5.1 Add or update server unit tests for overflow retention, ownership retention/clearing, and `>=` critical-mass explosion triggering
- [x] 5.2 Add or update server/integration tests for deterministic cascades that include retained-overflow intermediate states
- [x] 5.3 Add or update client unit tests for >4 atom visualization (3 atoms + raw total number) and unchanged 0..4 rendering behavior
- [x] 5.4 Add or update E2E tests to verify immediate per-step overflow visualization during chain-reaction animation sequences

## 6. Verification

- [x] 6.1 Run targeted unit test suites for touched server and client modules and fix regressions introduced by this change
- [x] 6.2 Run relevant integration and E2E suites for reaction flow, animation ordering, and responsive visibility
- [x] 6.3 Update documentation references only if implementation introduces user-visible wording or behavior clarifications
