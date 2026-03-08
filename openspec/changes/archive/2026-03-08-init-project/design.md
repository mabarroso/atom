## Context

The Atom game is a web-based board game for 1-2 players set in an atomic world. Currently, only the OpenSpec documentation structure exists. We need to establish a complete technical foundation that supports:
- Real-time multiplayer interaction via WebSockets
- Responsive web interface (desktop/tablet/mobile)
- Test-driven development workflow
- Modern Node.js backend with Express
- Clean separation of concerns (UI, styles, logic, services)

The project follows strict conventions: English for technical artifacts, Spanish for user-facing UI, TDD approach, and WCAG 2.2 Level AA accessibility compliance.

## Goals / Non-Goals

**Goals:**
- Create a runnable local development environment with hot-reload capabilities
- Establish server-client architecture with real-time communication
- Set up testing infrastructure (unit + E2E) ready for TDD workflow
- Implement proper project structure following separation of concerns
- Configure linting and code quality tools matching project conventions
- Provide clear documentation for developers to get started

**Non-Goals:**
- Game logic implementation (handled in future changes)
- Database setup (not needed initially - game state in memory)
- Production deployment configuration
- Authentication/authorization system
- Internationalization infrastructure (Spanish-only UI for now)

## Decisions

### 1. Project Structure: Monorepo with src/ Organization

**Decision:** Use a monorepo structure with `src/server/` and `src/client/` (public assets served statically).

**Rationale:**
- **Why this:** Simple deployment, shared constants/types possible, single repository to manage
- **Why not microservices:** Overkill for a board game; adds complexity without benefit at this scale
- **Why not flat structure:** Poor scalability; harder to separate server and client concerns

**Structure:**
```
src/
  server/
    index.js          # Express server entry point
    socket-handler.js # Socket.io event handlers
    game-logic/       # Game state management (future)
  client/
    index.html
    css/
    js/
      main.js         # Client initialization
      socket-client.js
public/               # Static assets served by Express
tests/
  unit/
  e2e/
```

### 2. Server Framework: Express with Minimal Middleware

**Decision:** Use Express with only essential middleware (express.static, body-parser if needed).

**Rationale:**
- **Why this:** Lightweight, well-documented, sufficient for serving static files and Socket.io
- **Why not frameworks like Fastify:** Express has better Socket.io integration examples and wider community support
- **Why not raw Node http:** Express provides useful utilities without bloat

**Middleware stack:**
- `express.static()` for client files
- Error handling middleware
- No CORS (same-origin for simplicity)

### 3. Real-Time Communication: Socket.io

**Decision:** Use Socket.io v4.x with automatic reconnection and event-based messaging.

**Rationale:**
- **Why this:** Built-in fallbacks (WebSocket → polling), automatic reconnection, room management for game sessions
- **Why not raw WebSockets:** No fallback mechanism, manual reconnection logic, no room abstraction
- **Why not SSE (Server-Sent Events):** Unidirectional; game needs bidirectional communication

**Event naming convention:**
- Client → Server: `client:actionName` (e.g., `client:joinGame`)
- Server → Client: `server:actionName` (e.g., `server:gameState`)
- Error events: `error:context` (e.g., `error:invalidMove`)

### 4. Client Architecture: Vanilla JavaScript with Module Pattern

**Decision:** Use vanilla JavaScript with ES6 modules, no build step initially.

**Rationale:**
- **Why this:** Matches project requirement (vanilla JS), modern browsers support ES6 modules natively
- **Why not framework (React/Vue):** Project explicitly requires vanilla JavaScript
- **Why not bundler:** Adds complexity; not needed for initial setup; can add later if performance requires

**Pattern:**
- Separate modules for: DOM manipulation, Socket.io client, game state, UI controllers
- No global variables except module entry point
- Use `type="module"` in script tags

### 5. CSS Framework: Bootstrap 5 with Custom Theme

**Decision:** Bootstrap 5 as base framework with minimal custom CSS.

**Rationale:**
- **Why this:** Responsive grid system, accessible components, mobile-first approach matches requirements
- **Why not custom CSS only:** Reinventing UI components violates "don't reinvent the wheel"
- **Why not Tailwind:** Bootstrap provides complete components; Tailwind requires more custom building

**Guidelines:**
- Use Bootstrap utility classes for spacing, layout
- Custom CSS only for game-specific visuals (board, atoms)
- Follow Bootstrap theming for consistency

### 6. Testing Stack: Jest for Unit + Playwright for E2E

**Decision:** Jest for unit tests (server + client), Playwright for E2E browser testing.

**Rationale:**
- **Why Jest:** Zero-config for Node.js, good mocking support, familiar to most developers
- **Why Playwright over Detox:** Detox is for React Native; Playwright is for web E2E with better debugging
- **Why not Cypress:** Playwright has better multi-browser support and faster execution

**Test organization:**
- Unit tests colocated or in `tests/unit/`
- E2E tests in `tests/e2e/` with page object pattern
- Minimum 80% coverage target for critical paths

### 7. Development Environment: npm Scripts + nodemon

**Decision:** Use npm scripts for tasks, nodemon for auto-reload during development.

**Rationale:**
- **Why this:** Simple, no external task runners needed, works across platforms
- **Why not Webpack dev server:** No bundling required initially
- **Why not Docker for dev:** Adds complexity; local Node.js sufficient for development

**Scripts:**
```json
{
  "start": "node src/server/index.js",
  "dev": "nodemon src/server/index.js",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:e2e": "playwright test",
  "lint": "eslint src/ tests/"
}
```

### 8. Code Quality: ESLint with Standard Style

**Decision:** ESLint with JavaScript Standard Style (2-space indent, no semicolons).

**Rationale:**
- **Why this:** Matches project conventions (2-space indent), widely accepted, minimal configuration
- **Why not Prettier:** Standard Style includes formatting rules; Prettier would be redundant
- **Why not custom rules:** Standard provides good defaults; custom rules add maintenance burden

**Key rules:**
- 2-space indentation (per project conventions)
- camelCase for variables/functions
- English-only for code, Spanish for UI strings
- No unused variables
- Consistent quote style

## Risks / Trade-offs

### Risk: No Build Step Limits Optimization
- **Impact:** Larger initial page load, no tree-shaking, no code splitting
- **Mitigation:** Accept for MVP; add Vite/Rollup later if performance becomes issue. Modern browsers cache modules well.

### Risk: In-Memory Game State Lost on Server Restart
- **Impact:** Active games lost if server crashes or deploys
- **Mitigation:** Document limitation; plan for Redis/database in future change when game logic is stable.

### Risk: Socket.io Scaling Limitations
- **Impact:** Won't scale horizontally without sticky sessions or Redis adapter
- **Mitigation:** Accept for MVP (single server sufficient for 100s of concurrent games); document for future.

### Risk: No TypeScript Means Runtime Type Errors
- **Impact:** Type-related bugs caught at runtime, not compile time
- **Mitigation:** Use JSDoc for critical functions; rely on comprehensive testing. Project doesn't specify TypeScript requirement.

### Trade-off: Bootstrap vs Custom CSS
- **Pro:** Faster development, accessible by default, responsive out of box
- **Con:** Generic look, larger CSS payload (~50KB min)
- **Decision:** Worth it for accessibility compliance and development speed

### Trade-off: Vanilla JS vs Framework
- **Pro:** No framework lock-in, smaller footprint, explicit project requirement
- **Con:** More manual DOM manipulation, no reactive data binding
- **Decision:** Required by project conventions; mitigate with clear module structure

## Migration Plan

### Initial Setup (First PR)
1. Initialize `package.json` with dependencies
2. Create basic directory structure
3. Set up ESLint configuration
4. Add npm scripts
5. Create minimal README with setup instructions

### Server Setup (Second PR)
1. Implement Express server with static file serving
2. Add Socket.io integration
3. Create example echo/ping endpoints for testing
4. Write unit tests for server initialization

### Client Setup (Third PR)
1. Create HTML shell with Bootstrap integration
2. Implement Socket.io client connection
3. Add connection status indicator (Spanish UI)
4. Write E2E test for client-server connection

### Testing Infrastructure (Fourth PR)
1. Configure Jest with proper ES6 module support
2. Set up Playwright with browser configurations
3. Add example unit test and E2E test
4. Document testing workflow in README

### Rollback Strategy
- All changes are additive (new files only)
- No existing functionality to break
- Rollback = delete workspace, re-clone repository

## Open Questions

1. **Port Configuration:** Use environment variable with default 3000, or hardcode initially?
   - **Recommendation:** ENV var with default - easy to implement, avoids port conflicts

2. **Logging Strategy:** Console.log vs dedicated logger (Winston/Pino)?
   - **Recommendation:** Console.log for MVP, add structured logging when debugging becomes painful

3. **Client-side Routing:** Single page or multi-page for game vs lobby?
   - **Recommendation:** Defer to game logic implementation; start with single page

4. **Test Coverage Threshold:** Enforce in CI or just track?
   - **Recommendation:** Track but don't block merges initially; enforce once workflows stabilize
