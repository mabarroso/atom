## 1. Remove connection-status UI elements

- [x] 1.1 Remove the "Estado de conexión" box markup from the client layout
- [x] 1.2 Remove the "Solicitar estado" button markup from the controls area
- [x] 1.3 Keep remaining layout structure and accessibility labels valid after removal

## 2. Clean client-side wiring

- [x] 2.1 Remove DOM queries/references tied to removed status box and request button
- [x] 2.2 Remove or adapt event handlers for manual status request so no orphan logic remains
- [x] 2.3 Ensure no runtime errors occur when status controls are absent

## 3. Validate behavior and quality

- [x] 3.1 Update/add tests asserting removed connection-status UI controls are not rendered
- [x] 3.2 Run targeted unit/E2E tests for game initialization and controls visibility
- [x] 3.3 Run lint and fix issues related to this change
