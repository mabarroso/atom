/**
 * Machine Player AI for Atom Game
 *
 * Implements 23 probabilistic decision rules for automated Player 2.
 * Rules are evaluated in priority order with probability thresholds.
 * Probability values mirror the "Machine Rules" section in openspec/project.md.
 *
 * @module machine-player
 */

/**
 * @typedef {{ player: number|null, atoms: number }} BoardCell
 */

/**
 * @typedef {{ row: number, col: number }} BoardPosition
 */

/**
 * @typedef {{ row: number, col: number } | null} MachineMove
 */

/**
 * @typedef {{ currentPlayer?: number, machineMode?: boolean, players?: Record<string, {name?: string, isHuman?: boolean}> }} MachineGameState
 */

const DIFFICULTY_PRESETS = {
  Medium: {
    // High-priority offensive rules (trigger reactions)
    cornerOffensive1Adjacent: 0.99,
    cornerOffensive2Adjacent: 0.99,
    edgeOffensive1Adjacent: 0.90,
    edgeOffensive2Adjacent: 0.95,
    edgeOffensive3Adjacent: 0.99,
    centerOffensive1Adjacent: 0.85,
    centerOffensive2Adjacent: 0.90,
    centerOffensive3Adjacent: 0.95,
    centerOffensive4Adjacent: 0.99,

    // Medium-priority strategic rules (build reactions)
    centerStrategic1Adjacent: 0.30,
    centerStrategic2Adjacent: 0.40,
    centerStrategic3Adjacent: 0.50,
    centerStrategic4Adjacent: 0.60,
    edgeStrategic1Adjacent: 0.40,
    edgeStrategic2Adjacent: 0.50,
    edgeStrategic3Adjacent: 0.60,
    cornerStrategic1Adjacent: 0.50,
    cornerStrategic2Adjacent: 0.60,

    // Low-priority tactical rules (positioning)
    occupyFreeCorner: 0.50,
    occupyEdgeAdjacentToOwnCorner: 0.50,
    occupyCenterAdjacentToOwn: 0.50,
    addToOwnCell: 0.50,
    occupyFreeCell: 0.50
  }
}

/**
 * Identifies the type of a cell based on its position.
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @param {number} size - Board size (N x N)
 * @returns {'corner'|'edge'|'center'} Cell type
 */
function getCellType (row, col, size) {
  const isCornerRow = row === 0 || row === size - 1
  const isCornerCol = col === 0 || col === size - 1

  if (isCornerRow && isCornerCol) {
    return 'corner'
  }

  if (isCornerRow || isCornerCol) {
    return 'edge'
  }

  return 'center'
}

/**
 * Gets critical mass for a cell type.
 * @param {'corner'|'edge'|'center'} cellType
 * @returns {number} Critical mass threshold
 */
function getCriticalMass (cellType) {
  switch (cellType) {
  case 'corner': return 2
  case 'edge': return 3
  case 'center': return 4
  default: return 4
  }
}

/**
 * Finds all valid adjacent cells to a given position.
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @param {number} size - Board size
 * @returns {Array<BoardPosition>} Adjacent cell coordinates
 */
function getAdjacentCells (row, col, size) {
  const adjacent = []
  const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1] // right
  ]

  for (const [dr, dc] of directions) {
    const newRow = row + dr
    const newCol = col + dc

    if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
      adjacent.push({ row: newRow, col: newCol })
    }
  }

  return adjacent
}

/**
 * Checks if a cell is at critical mass.
 * @param {BoardCell} cell - Cell state
 * @param {string} cellType - Cell type
 * @returns {boolean} True if at critical mass
 */
function isAtCriticalMass (cell, cellType) {
  if (!cell || cell.atoms === 0) return false
  return cell.atoms >= getCriticalMass(cellType)
}

function getCellOwner (cell) {
  if (!cell) {
    return null
  }

  return cell.player ?? cell.owner ?? null
}

/**
 * Main entry point for Machine move selection.
 * Evaluates rules in priority order and returns selected cell.
 *
 * @param {Array<Array<BoardCell>>} board - 2D board array
 * @param {MachineGameState} gameState - Current game state
 * @param {string} [difficulty='Medium'] - Difficulty level
 * @returns {MachineMove} Selected cell or null if no valid moves
 */
function selectMove (board, gameState, difficulty = 'Medium') {
  const size = board.length
  const probabilities = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.Medium
  const machinePlayer = 2 // Machine is always Player 2
  const opponentPlayer = 1

  // Helper: Check if move can be made on cell
  const canPlayCell = (row, col) => {
    const cell = board[row][col]
    return cell.atoms === 0 || getCellOwner(cell) === machinePlayer
  }

  // Helper: Count adjacent cells matching condition
  const countAdjacentMatching = (row, col, condition) => {
    const adjacent = getAdjacentCells(row, col, size)
    return adjacent.filter(pos => condition(board[pos.row][pos.col], getCellType(pos.row, pos.col, size))).length
  }

  // Rules 1-2: Corner cell offensive (99%)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cellType = getCellType(row, col, size)
      if (cellType !== 'corner' || !canPlayCell(row, col)) continue

      const criticalAdjacentCount = countAdjacentMatching(row, col, (cell, type) =>
        getCellOwner(cell) === opponentPlayer && isAtCriticalMass(cell, type)
      )

      if (criticalAdjacentCount >= 1 && Math.random() < probabilities.cornerOffensive1Adjacent) {
        logDecision('cornerOffensive1Adjacent', probabilities.cornerOffensive1Adjacent, row, col)
        return { row, col }
      }
    }
  }

  // Rules 3-5: Edge cell offensive (90-99%)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cellType = getCellType(row, col, size)
      if (cellType !== 'edge' || !canPlayCell(row, col)) continue

      const criticalAdjacentCount = countAdjacentMatching(row, col, (cell, type) =>
        getCellOwner(cell) === opponentPlayer && isAtCriticalMass(cell, type)
      )

      if (criticalAdjacentCount === 1 && Math.random() < probabilities.edgeOffensive1Adjacent) {
        logDecision('edgeOffensive1Adjacent', probabilities.edgeOffensive1Adjacent, row, col)
        return { row, col }
      }
      if (criticalAdjacentCount === 2 && Math.random() < probabilities.edgeOffensive2Adjacent) {
        logDecision('edgeOffensive2Adjacent', probabilities.edgeOffensive2Adjacent, row, col)
        return { row, col }
      }
      if (criticalAdjacentCount === 3 && Math.random() < probabilities.edgeOffensive3Adjacent) {
        logDecision('edgeOffensive3Adjacent', probabilities.edgeOffensive3Adjacent, row, col)
        return { row, col }
      }
    }
  }

  // Rules 6-9: Center cell offensive (85-99%)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cellType = getCellType(row, col, size)
      if (cellType !== 'center' || !canPlayCell(row, col)) continue

      const criticalAdjacentCount = countAdjacentMatching(row, col, (cell, type) =>
        getCellOwner(cell) === opponentPlayer && isAtCriticalMass(cell, type)
      )

      if (criticalAdjacentCount === 1 && Math.random() < probabilities.centerOffensive1Adjacent) {
        logDecision('centerOffensive1Adjacent', probabilities.centerOffensive1Adjacent, row, col)
        return { row, col }
      }
      if (criticalAdjacentCount === 2 && Math.random() < probabilities.centerOffensive2Adjacent) {
        logDecision('centerOffensive2Adjacent', probabilities.centerOffensive2Adjacent, row, col)
        return { row, col }
      }
      if (criticalAdjacentCount === 3 && Math.random() < probabilities.centerOffensive3Adjacent) {
        logDecision('centerOffensive3Adjacent', probabilities.centerOffensive3Adjacent, row, col)
        return { row, col }
      }
      if (criticalAdjacentCount === 4 && Math.random() < probabilities.centerOffensive4Adjacent) {
        logDecision('centerOffensive4Adjacent', probabilities.centerOffensive4Adjacent, row, col)
        return { row, col }
      }
    }
  }

  // Rules 10-13: Center cell strategic (30-60%)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cellType = getCellType(row, col, size)
      if (cellType !== 'center' || !canPlayCell(row, col)) continue

      const opponentAdjacentCount = countAdjacentMatching(row, col, (cell) =>
        getCellOwner(cell) === opponentPlayer && cell.atoms > 0
      )

      if (opponentAdjacentCount === 1 && Math.random() < probabilities.centerStrategic1Adjacent) {
        logDecision('centerStrategic1Adjacent', probabilities.centerStrategic1Adjacent, row, col)
        return { row, col }
      }
      if (opponentAdjacentCount === 2 && Math.random() < probabilities.centerStrategic2Adjacent) {
        logDecision('centerStrategic2Adjacent', probabilities.centerStrategic2Adjacent, row, col)
        return { row, col }
      }
      if (opponentAdjacentCount === 3 && Math.random() < probabilities.centerStrategic3Adjacent) {
        logDecision('centerStrategic3Adjacent', probabilities.centerStrategic3Adjacent, row, col)
        return { row, col }
      }
      if (opponentAdjacentCount === 4 && Math.random() < probabilities.centerStrategic4Adjacent) {
        logDecision('centerStrategic4Adjacent', probabilities.centerStrategic4Adjacent, row, col)
        return { row, col }
      }
    }
  }

  // Rules 14-16: Edge cell strategic (40-60%)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cellType = getCellType(row, col, size)
      if (cellType !== 'edge' || !canPlayCell(row, col)) continue

      const opponentAdjacentCount = countAdjacentMatching(row, col, (cell) =>
        getCellOwner(cell) === opponentPlayer && cell.atoms > 0
      )

      if (opponentAdjacentCount === 1 && Math.random() < probabilities.edgeStrategic1Adjacent) {
        logDecision('edgeStrategic1Adjacent', probabilities.edgeStrategic1Adjacent, row, col)
        return { row, col }
      }
      if (opponentAdjacentCount === 2 && Math.random() < probabilities.edgeStrategic2Adjacent) {
        logDecision('edgeStrategic2Adjacent', probabilities.edgeStrategic2Adjacent, row, col)
        return { row, col }
      }
      if (opponentAdjacentCount === 3 && Math.random() < probabilities.edgeStrategic3Adjacent) {
        logDecision('edgeStrategic3Adjacent', probabilities.edgeStrategic3Adjacent, row, col)
        return { row, col }
      }
    }
  }

  // Rules 17-18: Corner cell strategic (50-60%)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cellType = getCellType(row, col, size)
      if (cellType !== 'corner' || !canPlayCell(row, col)) continue

      const opponentAdjacentCount = countAdjacentMatching(row, col, (cell) =>
        getCellOwner(cell) === opponentPlayer && cell.atoms > 0
      )

      if (opponentAdjacentCount === 1 && Math.random() < probabilities.cornerStrategic1Adjacent) {
        logDecision('cornerStrategic1Adjacent', probabilities.cornerStrategic1Adjacent, row, col)
        return { row, col }
      }
      if (opponentAdjacentCount === 2 && Math.random() < probabilities.cornerStrategic2Adjacent) {
        logDecision('cornerStrategic2Adjacent', probabilities.cornerStrategic2Adjacent, row, col)
        return { row, col }
      }
    }
  }

  // Rule 19: Occupy free corner (50%)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cellType = getCellType(row, col, size)
      if (cellType === 'corner' && board[row][col].atoms === 0) {
        if (Math.random() < probabilities.occupyFreeCorner) {
          logDecision('occupyFreeCorner', probabilities.occupyFreeCorner, row, col)
          return { row, col }
        }
      }
    }
  }

  // Rule 20: Occupy edge adjacent to own corner (50%)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cellType = getCellType(row, col, size)
      if (cellType !== 'edge' || board[row][col].atoms !== 0) continue

      const hasOwnCornerAdjacent = getAdjacentCells(row, col, size).some(pos => {
        const adjType = getCellType(pos.row, pos.col, size)
        const adjCell = board[pos.row][pos.col]
        return adjType === 'corner' && getCellOwner(adjCell) === machinePlayer && adjCell.atoms > 0
      })

      if (hasOwnCornerAdjacent && Math.random() < probabilities.occupyEdgeAdjacentToOwnCorner) {
        logDecision('occupyEdgeAdjacentToOwnCorner', probabilities.occupyEdgeAdjacentToOwnCorner, row, col)
        return { row, col }
      }
    }
  }

  // Rule 21: Occupy center adjacent to own cell (50%)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cellType = getCellType(row, col, size)
      if (cellType !== 'center' || board[row][col].atoms !== 0) continue

      const hasOwnAdjacent = getAdjacentCells(row, col, size).some(pos => {
        const adjCell = board[pos.row][pos.col]
        return getCellOwner(adjCell) === machinePlayer && adjCell.atoms > 0
      })

      if (hasOwnAdjacent && Math.random() < probabilities.occupyCenterAdjacentToOwn) {
        logDecision('occupyCenterAdjacentToOwn', probabilities.occupyCenterAdjacentToOwn, row, col)
        return { row, col }
      }
    }
  }

  // Rule 22: Add to own cell not at max (50%)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = board[row][col]
      const cellType = getCellType(row, col, size)
      const criticalMass = getCriticalMass(cellType)

      if (getCellOwner(cell) === machinePlayer && cell.atoms > 0 && cell.atoms < criticalMass) {
        if (Math.random() < probabilities.addToOwnCell) {
          logDecision('addToOwnCell', probabilities.addToOwnCell, row, col)
          return { row, col }
        }
      }
    }
  }

  // Rule 23: Occupy any free cell (50%)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col].atoms === 0) {
        if (Math.random() < probabilities.occupyFreeCell) {
          logDecision('occupyFreeCell', probabilities.occupyFreeCell, row, col)
          return { row, col }
        }
      }
    }
  }

  // Fallback: select any free cell (guaranteed to work)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col].atoms === 0) {
        logDecision('fallback', 1.0, row, col, true)
        return { row, col }
      }
    }
  }

  // No valid moves (board is full with only Machine's cells)
  return null
}

/**
 * Logs Machine decision for debugging.
 * @param {string} ruleName - Name of the rule that triggered
 * @param {number} probability - Probability threshold used
 * @param {number} row - Selected row
 * @param {number} col - Selected column
 * @param {boolean} [isWarning=false] - Whether this is a fallback warning
 */
function logDecision (ruleName, probability, row, col, isWarning = false) {
  const timestamp = new Date().toISOString()
  const level = isWarning ? 'WARN' : 'INFO'
  console.log(`[Machine ${level}] ${timestamp} | Rule: ${ruleName} | Probability: ${probability} | Cell: (${row}, ${col})`)
}

module.exports = {
  selectMove,
  getCellType,
  getCriticalMass,
  getAdjacentCells,
  isAtCriticalMass
}
