# Atom

Juego de mesa en línea ambientado en el mundo atómico. Para uno o dos jugadores.

## Technologies Used

- Node.js
- Express
- Socket.io
- Bootstrap 5
- JavaScript Vanilla
- Jest
- Playwright

## Requirements

- Node.js 14 o superior
- npm

## Setup Instructions

1. Clona el repositorio.
2. Instala dependencias:
   - `npm install`
3. Crea entorno local:
   - `cp .env.example .env`

## Running the Application

- Desarrollo con recarga automática:
  - `npm run dev`
- Ejecución estándar:
  - `npm start`

Aplicación disponible en `http://localhost:3000`.

## Testing

- Unit tests:
  - `npm test`
- Unit tests (watch):
  - `npm run test:watch`
- E2E tests:
  - `npm run test:e2e`

## Project Structure

- `src/server/`: servidor Express y Socket.io
- `src/client/`: HTML, CSS y JavaScript del cliente
- `tests/unit/`: pruebas unitarias
- `tests/e2e/`: pruebas end-to-end
- `openspec/`: artefactos de especificación

## Development

- Lint:
  - `npm run lint`
