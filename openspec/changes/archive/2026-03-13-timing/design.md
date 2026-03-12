## Context

Current game pacing uses fixed delays: chain-reaction animation delay and machine-response delay are hardcoded. This change introduces user controls in the web UI to tune both values, including machine delay `0 ms`, while preserving turn rules, cascade order, and gameplay outcomes.

This is a cross-cutting update affecting client UI, client animation queue behavior, and server machine scheduling. Timing must remain deterministic within each match and stay consistent after state refresh/reconnect.

Constraints:
- Keep existing game rules unchanged; only timing behavior is configurable.
- Avoid new dependencies.
- Keep accessibility and responsive behavior for the new controls.

## Goals / Non-Goals

**Goals:**
- Add two user-visible controls: animation speed and machine response time.
- Allow machine response delay values down to `0 ms`.
- Apply selected timing values consistently to ongoing gameplay behavior.
- Ensure timing settings are synchronized through authoritative game state for all connected clients in the same match.

**Non-Goals:**
- No changes to machine decision logic, win conditions, or ownership rules.
- No redesign of existing animation effects beyond timing adjustments.
- No persistence across browser sessions unless already supported by existing state persistence.

## Decisions

1. Use authoritative server state for machine response delay and synchronized match-level timing settings.
   - Rationale: machine scheduling executes server-side and must be identical for all clients.
   - Alternative considered: client-only timing preference. Rejected because it cannot control machine turn scheduling consistently.

2. Keep animation playback delay configurable client-side but sourced from synchronized state.
   - Rationale: animation rendering happens on each client, but all players should observe the same intended pacing for a match.
   - Alternative considered: independent per-client animation controls. Rejected to avoid divergent perceived game progression in multiplayer sessions.

3. Introduce bounded numeric timing controls with explicit min/max/step values and allow `0` only where specified (machine response).
   - Rationale: prevents invalid timing values and enables predictable UI behavior.
   - Alternative considered: free-text inputs. Rejected due to validation complexity and higher error risk.

4. Apply timing updates immediately for subsequent animation steps and future machine moves, without retroactively rewriting already queued operations.
   - Rationale: preserves queue integrity and avoids race conditions.
   - Alternative considered: mutating in-flight queued delays. Rejected as brittle and harder to reason about.

5. Keep reduced-motion behavior as an accessibility override on the client.
   - Rationale: user accessibility preference must continue to take precedence over configured animation speed.
   - Alternative considered: always forcing configured delay. Rejected due to accessibility regression.

## Risks / Trade-offs

- [Risk] Very low delays can make gameplay feel abrupt and increase event bursts. → Mitigation: enforce safe upper/lower bounds and test rapid-update scenarios.
- [Risk] Timing updates during active cascades may appear inconsistent if users expect immediate retroactive effects. → Mitigation: document and implement “applies to next queued step/move” semantics.
- [Trade-off] Match-level synchronization removes per-user pacing preference in multiplayer. → Mitigation: prioritize shared deterministic experience and clarity.

## Migration Plan

- Add timing fields to authoritative game state and payloads used for state synchronization.
- Add UI controls and client wiring to emit timing-update actions.
- Update animation queue to consume synchronized animation delay values.
- Update machine move scheduling to consume synchronized machine-response delay, including `0 ms`.
- Add/adjust unit and E2E tests for bounds, synchronization, and behavior at `0 ms`.
- Rollback strategy: remove timing fields/controls and revert to existing constants.

## Open Questions

- None.