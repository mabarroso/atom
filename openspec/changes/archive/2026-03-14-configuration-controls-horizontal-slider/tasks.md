## 1. Settings timing controls as horizontal sliders

- [x] 1.1 Replace `Velocidad animación (ms)` control with a horizontal slider in the settings panel
- [x] 1.2 Replace `Respuesta máquina (ms)` control with a horizontal slider in the settings panel
- [x] 1.3 Preserve Spanish labels and descriptive `aria-label` attributes for both slider controls

## 2. Slider constraints and synchronization behavior

- [x] 2.1 Ensure animation speed slider enforces `min=0`, `max=24000`, `step=100`
- [x] 2.2 Ensure machine response slider enforces `min=0`, `max=5000`, `step=100`
- [x] 2.3 Ensure slider values render from authoritative state and remain synchronized across connected clients
- [x] 2.4 Ensure reconnect restores both slider values from synchronized authoritative state

## 3. Client event handling compatibility

- [x] 3.1 Keep existing timing update event/payload flow when slider values change
- [x] 3.2 Verify no server timing logic changes are required for slider input interaction
- [x] 3.3 Confirm both controls remain keyboard and pointer operable

## 4. Automated test coverage

- [x] 4.1 Update/add client unit tests for slider rendering, labels, ranges, steps, and emitted timing updates
- [x] 4.2 Update/add integration or server-adjacent tests only if needed to validate unchanged timing payload compatibility
- [x] 4.3 Update/add E2E coverage for changing both sliders in settings and observing synchronized visible values

## 5. Verification

- [x] 5.1 Run targeted unit tests for touched client modules
- [x] 5.2 Run relevant E2E tests for settings/timing controls
- [x] 5.3 Run lint and address issues related to the change
