# Atom
Online tabletop game set in the atomic world. For one or two players.

## Technologies Used
- **Server:** Node.js with Express.
- **Real-Time Communication:** Socket.io.
- **User Interface:** HTML5, CSS3 (Modern and Responsive), Bootstrap and Vanilla JavaScript.

## Requirements
- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (Node package manager)

## Project Conventions
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

## Installation and Configuration
1.  **Clone the project:**
    ```bash
    git clone git@github.com:mabarroso/atom.git
    cd atom
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the application:**
    ```bash
    npm start
    # or directly
    node index.js
    ```
4.  **Access:**
    Open your browser at `http://localhost:3000`.


## Objective
Web application that allows one or two people to have a turn-based board game. We will call them players. There will be Player 1 and Player 2.

## Game Start
The first player to enter will be Player 1. They will create the game and choose the board size. The board is always N x N. Player 1 will choose the value of N between 1 and 10. Columns are named with letters (A, B, C, D, E, F, G, H, I and J) and rows with numbers (1, 2, 3, 4, 5, 6, 7, 8, 9 and 10). Each cell is named by its column letter and row number. For example: A1 for the cell of the first row and first column.

There are 3 types of cells:
- Corners: Have two adjacent cells. For example, in a 4x4 board, the corner cells are A1, D1, A4, D4.
- Edges: Have three adjacent cells. For example, in a 4x4 board, the edge cells are A2, A3, B1, B4, C1, C4, D2, D3.
- Centers: Have four adjacent cells. For example, in a 4x4 board, the center cells are B2, B3, C2, C3.

Once the board size is decided, the first game will begin. The game counter will be 1. Each player will have 0 points. The game counter and each player's points will be displayed next to the board by drawing all cells. The cells will be the same size and must be able to contain 4 characters in 2x2 format. We call characters "atoms". The atoms to use will be "x" and "o".

The "o" atom belongs to Player 1.
The "x" atom belongs to Player 2.

A cell with atoms from Player 1 is a cell occupied by Player 1.
A cell with atoms from Player 2 is a cell occupied by Player 2.

Atoms are arranged in each cell as follows:
- Cell with 1 atom from Player 1:<pre>o 
  </pre>
- Cell with 2 atoms from Player 1:<pre> o
o </pre>
- Cell with 3 atoms from Player 1:<pre>oo
o </pre>
- Cell with 4 atoms from Player 1:<pre>oo
oo</pre>
- Cell with 5 atoms from Player 1:<pre>oo
o5</pre>
- Cell with 6 atoms from Player 1:<pre>oo
o6</pre>
- Cell with 1 atom from Player 2:<pre>x 
  </pre>
- Cell with 2 atoms from Player 2:<pre> x
x </pre>
- Cell with 3 atoms from Player 2:<pre>xx
x </pre>
- Cell with 4 atoms from Player 2:<pre>xx
xx</pre>
- Cell with 5 atoms from Player 2:<pre>xx
x5</pre>
- Cell with 6 atoms from Player 2:<pre>xx
x6</pre>
- Empty cell:<pre>  
  </pre>
  

## Player 2
Player 1 will be given a unique URL (must not have been given before and never given again) which Player 2 will use to join the game. For any player who does not use this type of URL, they will be considered Player 1 in a new game.

For any player who uses the URL and there is no corresponding game, they will be considered Player 1 in a new game but the unique URL given to them will be the same as the one they used to enter.

If Player 1 chooses not to use the URL, the second player will be Machine. Machine will play according to rules that will be defined later.

## Player Disconnection and Return
If Player 2 loses connection, they can use the URL again to return to the game and continue being Player 2.

If Player 1 loses connection, they can use the URL again to return to the game and continue being Player 1.

If both players lose connection, the game ends.

## Game
During the game, players take actions by turns. We call a move the action of each player. The game will last until no more moves can be made.

A turn consists of:
1. New turn starts
2. Player 1 makes their move.
3. Player 2 makes their move.
4. Turn ends.
5. Go back to point 1.

A move consists of the player adding an atom to a cell. They will select the cell by indicating its identification (column and row) or by clicking on it with the mouse. They can only add an atom to an empty cell or to a cell with atoms of their own.

Each cell accepts a maximum number of atoms:
- Corner: 2 atoms.
- Edge: 3 atoms.
- Center: 4 atoms.

When a cell reaches the maximum number of atoms it accepts, a reaction occurs. A reaction is resolved following these steps:
- Step 1. Empty the cell.
- Step 2. Add one atom to each adjacent cell.
- Step 3. If the cell to which the atom is added has atoms from another player, convert them to atoms of the player making the move.
- Step 4. If the cells to which the atom has been added exceed the maximum number of atoms they accept, apply step 1 to each of them.

## Game End
Players can no longer make actions when N-1 cells have more atoms than they accept or all cells have atoms from the same player and there are no empty cells.

When players can no longer make actions, the game ends. A point is added to the player who made the last move and the option is given to start a new game while continuing the reactions that remain to be resolved.

## Machine Rules
- With 99% probability: Creates a reaction in a corner cell if it has 1 adjacent cell occupied by Player 1 with the maximum number of atoms.
- With 99% probability: Creates a reaction in a corner cell if it has 2 adjacent cells occupied by Player 1 with the maximum number of atoms.
- With 90% probability: Creates a reaction in an edge cell if it has 1 adjacent cell occupied by Player 1 with the maximum number of atoms.
- With 95% probability: Creates a reaction in an edge cell if it has 2 adjacent cells occupied by Player 1 with the maximum number of atoms.
- With 99% probability: Creates a reaction in an edge cell if it has 3 adjacent cells occupied by Player 1 with the maximum number of atoms.
- With 85% probability: Creates a reaction in a center cell if it has 1 adjacent cell occupied by Player 1 with the maximum number of atoms.
- With 90% probability: Creates a reaction in a center cell if it has 2 adjacent cells occupied by Player 1 with the maximum number of atoms.
- With 95% probability: Creates a reaction in a center cell if it has 3 adjacent cells occupied by Player 1 with the maximum number of atoms.
- With 99% probability: Creates a reaction in a center cell if it has 4 adjacent cells occupied by Player 1 with the maximum number of atoms.
- With 30% probability: Creates a reaction in a center cell if it has 1 adjacent cell occupied by Player 1.
- With 40% probability: Creates a reaction in a center cell if it has 2 adjacent cells occupied by Player 1.
- With 50% probability: Creates a reaction in a center cell if it has 3 adjacent cells occupied by Player 1.
- With 60% probability: Creates a reaction in a center cell if it has 4 adjacent cells occupied by Player 1.
- With 40% probability: Creates a reaction in an edge cell if it has 1 adjacent cell occupied by Player 1.
- With 50% probability: Creates a reaction in an edge cell if it has 2 adjacent cells occupied by Player 1.
- With 60% probability: Creates a reaction in an edge cell if it has 3 adjacent cells occupied by Player 1.
- With 50% probability: Creates a reaction in a corner cell if it has 1 adjacent cell occupied by Player 1.
- With 60% probability: Creates a reaction in a corner cell if it has 2 adjacent cells occupied by Player 1.
- With 50% probability: Occupies a free corner.
- With 50% probability: Occupies a free edge adjacent to a corner occupied by Player 2.
- With 50% probability: Occupies a free center adjacent to a cell occupied by Player 2.
- With 50% probability: Adds to a cell occupied by Player 2 that does not have the maximum number of atoms.
- With 50% probability: Occupies a free cell.
- If nothing from the above has been done, adds to a cell occupied by Player 2.
