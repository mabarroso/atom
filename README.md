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

### Known E2E Limitations

- Actualmente existen 2 escenarios marcados como `fixme` en `tests/e2e/game-flow.spec.js`:
  - `Multi-step cascade explosions produce animation sequence`
  - `Win condition triggers when opponent has no atoms`
- Motivo: sincronización multi-cliente inestable entre navegadores (timing/race conditions en Chromium/WebKit).
- Estado actual del suite E2E: pasa correctamente con esos casos omitidos.

### Pending Manual Validation

- Animaciones de reacción en cadena (`18.6`): revisar visualmente que la secuencia sea clara y fluida en navegador real.
- Lector de pantalla (`18.9`): validar anuncios ARIA con NVDA o VoiceOver durante turnos, errores y fin de partida.

## How to Play

1. Abre la app en dos pestañas o dos navegadores.
2. Presiona `Nueva Partida` para crear una sesión.
3. El segundo jugador se une usando la misma sesión en la otra pestaña.
4. En tu turno, selecciona una celda vacía o una celda propia para añadir un átomo.
5. Cuando una celda alcanza su masa crítica, explota y distribuye átomos a celdas adyacentes.
6. Gana el último jugador que conserva átomos en el tablero.

## Configuración del Juego

- Tamaño de tablero por defecto: `6x6`.
- Tamaño permitido: de `4x4` a `10x10`.
- Colores de jugadores:
  - Jugador 1: Azul `#007bff`
  - Jugador 2: Naranja `#fd7e14`
- Retardo base de animaciones: `300ms`.

## Socket Events

### Client -> Server

- `client:statusRequest`
- `client:game:start`
- `client:game:move`
- `client:game:stateRequest`

### Server -> Client

- `server:statusUpdate`
- `server:game:started`
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

- `src/server/`: servidor Express y Socket.io
- `src/client/`: HTML, CSS y JavaScript del cliente
- `tests/unit/`: pruebas unitarias
- `tests/e2e/`: pruebas end-to-end
- `openspec/`: artefactos de especificación

## Development

- Lint:
  - `npm run lint`

## Troubleshooting

- Si el servidor no inicia por puerto ocupado:
  - revisa procesos en `3000` y libera el puerto
- Si no aparecen celdas del tablero:
  - verifica la conexión Socket.io y que `server:game:started` se esté emitiendo
- Si Playwright falla por servidor no disponible:
  - confirma que `http://127.0.0.1:3000/health` responde `{"status":"ok"}`
- Si las pruebas de accesibilidad fallan:
  - revisa atributos `aria-label`, `aria-live` y foco visible en celdas/botones
