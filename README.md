# Atom

Online tabletop game set in the atomic world. For one or two players.

## Technologies Used

- Node.js
- Express
- Socket.io
- Bootstrap 5
- JavaScript Vanilla
- Jest
- Playwright

## Requirements

- Node.js 14 or higher
- npm

## Setup Instructions

1. Clone the repository.
2. Install dependencies:
   - `npm install`
3. Create local environment:
   - `cp .env.example .env`

## Running the Application

- Development with automatic reload:
  - `npm run dev`
- Standard execution:
  - `npm start`

Application available at `http://localhost:3000`.

## Testing

- Unit tests:
  - `npm test`
- Unit tests (watch):
  - `npm run test:watch`
- E2E tests:
  - `npm run test:e2e`

### Known E2E Limitations

- Currently there are 2 scenarios marked as `fixme` in `tests/e2e/game-flow.spec.js`:
  - `Multi-step cascade explosions produce animation sequence`
  - `Win condition triggers when opponent has no atoms`
- Reason: unstable multi-client synchronization between browsers (timing/race conditions in Chromium/WebKit).
- Current E2E test suite status: passes correctly with those cases omitted.

### Pending Manual Validation

- Chain-reaction animations (`18.6`): visually verify that the sequence is clear and smooth in real browser.
- Screen reader (`18.9`): validate ARIA announcements with NVDA or VoiceOver during turns, errors, and game end.

## How to Play

1. Open the app in two tabs or two browsers.
2. Choose game mode:
  - `Vs Jugador` for multiplayer
  - `Vs Máquina` for single-player mode
3. Press `New Game` to create a session.
4. In `Vs Jugador`, the second player joins using the same session in the other tab.
5. On your turn, select an empty cell or your own cell to add an atom.
6. When a cell reaches its critical mass, it explodes and distributes atoms to adjacent cells.
7. The last player to keep atoms on the board wins.

## Game Configuration

- Default board size: `6x6`.
- Allowed size: from `4x4` to `10x10`.
- Player colors:
  - Player 1: Blue `#007bff`
  - Player 2: Orange `#fd7e14`
- Base animation delay: `300ms`.

## Socket Events

### Client -> Server

- `client:statusRequest`
- `client:game:start`
- `client:game:move`
- `client:game:stateRequest`

### Server -> Client

- `server:statusUpdate`
- `server:game:started`
- `server:game:machineMove`
- `server:game:stateUpdate`
- `server:game:turnChanged`
- `server:game:ended`

### Error Events

- `error:internal`
- `error:game:invalidMove`
- `error:game:notYourTurn`
- `error:game:notActive`
- `error:game:notFound`
- `error:game:roomFull`

## Project Structure

- `src/server/`: Express and Socket.io server
- `src/client/`: Client HTML, CSS and JavaScript
- `tests/unit/`: Unit tests
- `tests/e2e/`: End-to-end tests
- `openspec/`: Specification artifacts

## Development

- Lint:
  - `npm run lint`

## Troubleshooting

- If the server fails to start due to port already in use:
  - check processes on port `3000` and free the port
- If board cells don't appear:
  - verify Socket.io connection and that `server:game:started` is being emitted
- If Playwright fails due to server unavailable:
  - confirm that `http://127.0.0.1:3000/health` responds with `{"status":"ok"}`
- If accessibility tests fail:
  - check `aria-label`, `aria-live` attributes and visible focus on cells/buttons
