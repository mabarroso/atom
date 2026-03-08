# Atom
Un juego de mesa en línea ambientado en el mundo atómico. Para uno o dos jugadores.

## Tecnologías Utilizadas
- **Servidor:** Node.js con Express.
- **Comunicación en Tiempo Real:** Socket.io.
- **Interfaz de Usuario:** HTML5, CSS3 (Moderno y Responsivo), Bootstrap y JavaScript (Vanilla).

## Requisitos
- [Node.js](https://nodejs.org/) (v14 o superior)
- npm (gestor de paquetes de Node)

## Convenciones del proyecto
### Language Standards
- **Technical Artifacts (English)**: All internal artifacts must use English, including:
    - Code (variables, functions, classes, comments, logs)
    - Exception messages within the code
    - Technical Documentation (AI guides, API docs)
    - Git commit messages
    - Test names and technical descriptions
- **User Interface (Spanish)**: All user-facing texts must always be in **Spanish**, including:
    - Labels, buttons, and titles
    - Placeholders and hints
    - User-facing error messages and notifications
    - Data schemas names (remain English)

### Code Style
- Consistent indentation (2 spaces) and semantic HTML.
- Variables and functions use camelCase.
- JSON keys are lowercase and domain-specific.
- Avoid hardcoding values; prefer configuration-driven logic.
- CSS uses IDs for key components.

### Core Principles
- **Small tasks, one at a time**: Always work in baby steps, one at a time. Never go forward more than one step.
- **Test-Driven Development**: Write tests before or alongside implementation. Start with failing tests for any new functionality (TDD), according to the task details.
- **Type Safety**: All code must be fully typed.
- **Clear Naming**: Use clear, descriptive names for all variables and functions.
- **Incremental Changes**: Prefer incremental, focused changes over large, complex modifications.
- **Question Assumptions**: Always question assumptions and inferences.
- **Pattern Detection**: Detect and highlight repeated code patterns.
- Validate linting and tests before considering work complete.
- Prefer clarity over cleverness.
- Document architectural decisions and trade-offs.
- When in doubt, ask clarifying questions before implementing.

### UI/UX Guidelines
-   **Consistency**: Follow the Bootstrap theme configuration. Avoid custom CSS unless absolutely necessary.
-   **Accessibility**: Strict compliance with **WCAG 2.2 Level AA** and **EN 301 549**. 
-   **Responsiveness**: Mobile-first approach.
-   **Modern Aesthetic**: Clean, professional, and accessible.
-   **Language**: All user-facing texts (labels, placeholders, messages) must always be in **Spanish**.

### Testing
-   **Unit Tests**: Vitest for testing composables, stores, and complex component logic.
-   **E2E Tests**: Playwright for critical user flows and integration scenarios.

### Git Workflow
- Branching strategy: lightweight Git Flow
 - main for stable releases
 - feature branches for new components or audio logic
- Commit conventions: Conventional Commits (feat:, fix:, test:, docs:).
- Pull requests require code review and passing tests before merging.

## Instalación y Configuración
1.  **Clonar el proyecto:**
    ```bash
    git clone git@github.com:mabarroso/atom.git
    cd atom
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Iniciar la aplicación:**
    ```bash
    npm start
    # o directamente
    node index.js
    ```
4.  **Acceder:**
    Abre tu navegador en `http://localhost:3000`.


## Objetivo
Aplicación web que permite a una o dos personas tener un juego de tablero por turnos. A las personas las llamaremos jugadores. Habrá Jugador 1 y Jugador 2.

## Inicio del juego
El primer jugador en entrar será Jugador 1. Creará el juego y elegirá el tamaño del tablero. El tablero será siempre N x N. Jugador 1 elegirá el valor de N entre 1 Y 10. Las columnas se nombraran con letras (A, B, C, D, E, F, G, H, I Y J) y las filas con números (1, 2, 3, 4, 5, 6, 7, 8, 9 Y 10). Cada casilla se nombrará por la letra de su columna y el número de su fila. Por ejemplo: A1 para la casilla de la primera fila y primera columna.

Hay 3 tipos de casillas:
- Esquinas: Tienen dos casillas adyacentes. Por ejemplo, en un tablero de 4x4, las casilla esquina son A1, D1, A4, D4.
- Bordes: Tienen tres casillas adyacente. Por ejemplo, en un tablero de 4x4, las casillas borde son A2, A3, B1, B4, C1, C4, D2, D3.
- Centros: Tienen cuatro casillas adyacentes. Por ejemplo, en un tablero de 4x4, las casillas centro son B2, B3, C2, C3.

Una vez decidido el tamaño del tablero comenzará la primera partida. El contador de partidas será 1. Cada jugador tendrá como puntos 0. Se mostrará el contador de partidas y puntos de cada jugador junto al tablero dibujando todas las casillas. Las casillas serán de igual tamaño y deben poder contener 4 caracteres de forma 2x2. A los caracteres lo llamaremos átomos. Los átomos a usar serán "x" y "o".

El átomo o será del Jugador 1.
El átomo x será del Jugador 2.

Una casilla con átomos del Jugador 1 será una casilla ocupada por el Jugador 1.
Una casilla con átomos del Jugador 2 será una casilla ocupada por el Jugador 2.

Los átomos estarán dispuestos en cada casilla de la siguiente forma:
- Casilla con 1 átomo del Jugador 1:<pre>o 
  </pre>
- Casilla con 2 átomos del Jugador 1:<pre> o
o </pre>
- Casilla con 3 átomos del Jugador 1:<pre>oo
o </pre>
- Casilla con 4 átomos del Jugador 1:<pre>oo
oo</pre>
- Casilla con 5 átomos del Jugador 1:<pre>oo
o5</pre>
- Casilla con 6 átomos del Jugador 1:<pre>oo
o6</pre>
- Casilla con 1 átomo del Jugador 2:<pre>x 
  </pre>
- Casilla con 2 átomos del Jugador 2:<pre> x
x </pre>
- Casilla con 3 átomos del Jugador 2:<pre>xx
x </pre>
- Casilla con 4 átomos del Jugador 2:<pre>xx
xx</pre>
- Casilla con 5 átomos del Jugador 2:<pre>xx
x5</pre>
- Casilla con 6 átomos del Jugador 2:<pre>xx
x6</pre>
- Casilla vacía:<pre>  
  </pre>
  

## Jugador 2
Al Jugador 1 se le dará una url única (no debe haberse dado antes ni volver a darse después) que usará Jugador 2 para unirse a la partida. Para cualquier jugador que no use una url de este tipo se le considerará Jugador 1 en una partida nueva.

Para cualquier jugador que al usar la url no haya un juego que corresponda, se le considerará Jugador 1 en una partida nueva pero la url única que se le dará será la misma que usó para entrar.

Si Jugador 1 elige no usar la url, el segundo jugador será Máquina. Máquina jugará según unas reglas que se definirán más adelante.

## Salida y vuelta de jugadores
Si Jugador 2 pierde la conexión, puede volver a usar la url para regresar al juego y seguir siendo Jugador 2.

Si Jugador 1 pierde la conexión, puede volver a usar la url para regresar al juego y seguir siendo Jugador 1.

Si los dos jugadores pierden la conexión, el juego termina.

## Partida
Durante la partida los jugadores realizarán acciones por turnos. Llamaremos movimiento a la acción de cada jugador. La partida durará hasta que no sea posible realizar más movimientos.

Un turno consiste en:
1. Inicio de turno nuevo
2. Jugador 1 realiza su movimiento.
3. Jugador 2 realiza su movimiento.
4. Fin del turno.
5. Vuelta al punto 1.

Un movimiento consiste en que el jugador añada un átomo a una casilla. Seleccionará la casilla indicando su identificación (columna y fila) o clicando sobre ella con el ratón. Sólo podrá añadir un átomo a una casilla vacía o a una casilla en la haya átomos suyos.

Cada casilla admite un número máximo de átomos:
- Esquina: 2 átomos.
- Borde: 3 átomos.
- Centro: 4 átomos.

Cuando una casilla llega al número máximo de átomos que acepta se producirá una reacción. Una reacción se resuelve siguiendo los siguientes pasos:
- Paso 1. Deja la casilla vacía.
- Paso 2. Añade un átomo a cada casilla adyacente a ella. 
- Paso 3. Si la casilla a la que añade el átomo tiene átomos de otro jugador, los convierte a átomos del jugador que hace el movimiento.
- Paso 4. Si las casillas a la que ha añadido el átomo superan el número máximo de átomos que acepta, se aplica el paso 1 para cada una.

## Fin de la partida
Los jugadores no podrán realizar más acciones cuando N-1 casillas tengan más átomos de los que admite o todas las casillas tengan átomos de un mismo jugador y no haya casillas vacías.

Cuando los jugadores no pueden realizar más acciones la partida termina. Se suma un punto al jugador que haya hecho el último movimiento y se da la opción de comenzar una nueva partida mientras se continúan las reacciones que queden por resolver.

## Reglas de Máquina
- Con una probabilidad del 99%: Crea una reacción en una casilla esquina si tiene 1 casilla adyacente ocupada por Jugador 1 con el número máximo de átomos.
- Con una probabilidad del 99%: Crea una reacción en una casilla esquina si tiene 2 casillas adyacentes ocupada por Jugador 1 con el número máximo de átomos.
- Con una probabilidad del 90%: Crea una reacción en una casilla borde si tiene 1 casilla adyacente ocupada por Jugador 1 con el número máximo de átomos.
- Con una probabilidad del 95%: Crea una reacción en una casilla borde si tiene 2 casillas adyacentes ocupada por Jugador 1 con el número máximo de átomos.
- Con una probabilidad del 99%: Crea una reacción en una casilla borde si tiene 3 casillas adyacente ocupada por Jugador 1 con el número máximo de átomos.
- Con una probabilidad del 85%: Crea una reacción en una casilla centro si tiene 1 casilla adyacente ocupada por Jugador 1 con el número máximo de átomos.
- Con una probabilidad del 90%: Crea una reacción en una casilla centro si tiene 2 casillas adyacentes ocupada por Jugador 1 con el número máximo de átomos.
- Con una probabilidad del 95%: Crea una reacción en una casilla centro si tiene 3 casillas adyacentes ocupada por Jugador 1 con el número máximo de átomos.
- Con una probabilidad del 99%: Crea una reacción en una casilla centro si tiene 4 casilla adyacentes ocupada por Jugador 1 con el número máximo de átomos.
- Con una probabilidad del 30%: Crea una reacción en una casilla centro si tiene 1 casilla adyacente ocupada por Jugador 1.
- Con una probabilidad del 40%: Crea una reacción en una casilla centro si tiene 2 casillas adyacentes ocupada por Jugador 1.
- Con una probabilidad del 50%: Crea una reacción en una casilla centro si tiene 3 casillas adyacentes ocupada por Jugador 1.
- Con una probabilidad del 60%: Crea una reacción en una casilla centro si tiene 4 casilla adyacentes ocupada por Jugador 1.
- Con una probabilidad del 40%: Crea una reacción en una casilla borde si tiene 1 casilla adyacente ocupada por Jugador 1.
- Con una probabilidad del 50%: Crea una reacción en una casilla borde si tiene 2 casillas adyacentes ocupada por Jugador 1.
- Con una probabilidad del 60%: Crea una reacción en una casilla borde si tiene 3 casillas adyacente ocupada por Jugador 1.
- Con una probabilidad del 50%: Crea una reacción en una casilla esquina si tiene 1 casilla adyacente ocupada por Jugador 1.
- Con una probabilidad del 60%: Crea una reacción en una casilla esquina si tiene 2 casillas adyacentes ocupada por Jugador 1.
- Con una probabilidad del 50%: Ocupa una esquina libre.
- Con una probabilidad del 50%: Ocupa un borde libre adyacente a una esquina ocupada por Jugador 2.
- Con una probabilidad del 50%: Ocupa un centro libre adyacente a una casilla ocupada por Jugador 2.
- Con una probabilidad del 50%: Añade a una casilla ocupada por Jugador 2 que no tenga el número máximo de átomos.
- Con una probabilidad del 50%: Ocupa una casilla libre.
- Si no se ha hecho nada de lo anterior, añade a una casilla ocupada por Jugador 2.
