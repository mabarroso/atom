const {
  DEFAULT_ANIMATION_DELAY,
  MAX_CASCADE_EXPLOSIONS
} = require('./constants')

/**
 * Create stable key for queue deduplication.
 * @param {number} row
 * @param {number} col
 * @returns {string}
 */
function positionKey (row, col) {
  return `${row}:${col}`
}

function comparePositions (first, second) {
  if (first.row !== second.row) {
    return first.row - second.row
  }

  return first.col - second.col
}

/**
 * Scan board for cells that must explode now.
 * @param {import('./game-board').Board} board
 * @returns {{row:number,col:number}[]}
 */
function detectExplosions (board) {
  const explodingCells = []
  for (let row = 0; row < board.size; row += 1) {
    for (let col = 0; col < board.size; col += 1) {
      const atoms = board.getAtomCount(row, col)
      const criticalMass = board.getCriticalMass(row, col)
      if (atoms >= criticalMass && atoms > 0) {
        explodingCells.push({ row, col })
      }
    }
  }

  explodingCells.sort(comparePositions)
  return explodingCells
}

/**
 * Resolve one explosion and redistribute atoms.
 * @param {import('./game-board').Board} board
 * @param {number} row
 * @param {number} col
 * @param {number} player
 * @returns {{row:number,col:number}[]}
 */
function resolveExplosion (board, row, col, player) {
  const cell = board.getCell(row, col)
  if (!cell) {
    return {
      affectedCells: [],
      remainingAtoms: 0,
      sourcePlayer: null
    }
  }

  const affectedCells = board.getAdjacentCells(row, col)
  const remainingAtoms = Math.max(0, cell.atoms - affectedCells.length)

  cell.atoms = remainingAtoms
  cell.player = remainingAtoms > 0 ? player : null

  affectedCells.forEach((position) => {
    const adjacentCell = board.getCell(position.row, position.col)
    adjacentCell.atoms += 1
    adjacentCell.player = player
  })

  return {
    affectedCells,
    remainingAtoms,
    sourcePlayer: cell.player
  }
}

function addToQueue (queue, queuedSet, row, col) {
  const key = positionKey(row, col)
  if (queuedSet.has(key)) {
    return
  }

  queue.push({ row, col })
  queuedSet.add(key)
  queue.sort(comparePositions)
}

/**
 * Build UI-friendly animation sequence with delays.
 * @param {Array<object>} events
 * @param {number} delay
 * @returns {Array<object>}
 */
function generateAnimationSequence (events, delay = DEFAULT_ANIMATION_DELAY) {
  return events.map((event, index) => ({
    ...event,
    delay: index * delay
  }))
}

/**
 * Resolve cascade using iterative queue traversal.
 * @param {import('./game-board').Board} board
 * @param {number} player
 * @param {number} maxExplosions
 * @returns {{events:Array<object>,truncated:boolean,animationSequence:Array<object>}}
 */
function resolveCascade (board, player, maxExplosions = MAX_CASCADE_EXPLOSIONS, animationDelay = DEFAULT_ANIMATION_DELAY) {
  const queue = []
  const queuedSet = new Set()
  const processed = []

  detectExplosions(board).forEach((position) => {
    addToQueue(queue, queuedSet, position.row, position.col)
  })

  while (queue.length > 0 && processed.length < maxExplosions) {
    const current = queue.shift()
    queuedSet.delete(positionKey(current.row, current.col))

    const atoms = board.getAtomCount(current.row, current.col)
    const criticalMass = board.getCriticalMass(current.row, current.col)
    // Skip stale queue entries where previous explosions already stabilized the cell.
    if (atoms < criticalMass || atoms === 0) {
      continue
    }

    const sourceAtomsBeforeExplosion = atoms
    const explosionResult = resolveExplosion(board, current.row, current.col, player)
    const affectedCells = explosionResult.affectedCells
    processed.push({
      row: current.row,
      col: current.col,
      player,
      atoms: sourceAtomsBeforeExplosion,
      timestamp: Date.now(),
      sourceCell: {
        row: current.row,
        col: current.col,
        atoms: explosionResult.remainingAtoms,
        player: explosionResult.sourcePlayer
      },
      board: board.toJSON()
    })

    const currentAtomsAfterExplosion = board.getAtomCount(current.row, current.col)
    if (currentAtomsAfterExplosion >= criticalMass) {
      addToQueue(queue, queuedSet, current.row, current.col)
    }

    // Re-check impacted neighbors only, keeping cascade deterministic and efficient.
    affectedCells.forEach((position) => {
      const adjacentAtoms = board.getAtomCount(position.row, position.col)
      const adjacentCriticalMass = board.getCriticalMass(position.row, position.col)
      if (adjacentAtoms >= adjacentCriticalMass && adjacentAtoms > 0) {
        addToQueue(queue, queuedSet, position.row, position.col)
      }
    })
  }

  return {
    events: processed,
    truncated: queue.length > 0,
    animationSequence: generateAnimationSequence(processed, animationDelay)
  }
}

module.exports = {
  detectExplosions,
  resolveExplosion,
  resolveCascade,
  generateAnimationSequence
}
