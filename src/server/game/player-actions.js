const { GAME_STATES } = require('./game-state')

const ERROR_MESSAGES = {
  invalidMove: 'Movimiento inválido: no puedes jugar en esta celda',
  notYourTurn: 'No es tu turno',
  waitExplosions: 'Espera a que terminen las explosiones',
  notActive: 'La partida no está activa',
  invalidCell: 'Celda inválida'
}

function createError (code, message) {
  return {
    code,
    message
  }
}

/**
 * Validate a move against game-state constraints.
 * @param {import('./game-state').GameState} gameState
 * @param {number} player
 * @param {number} row
 * @param {number} col
 * @returns {{valid:boolean,error?:{code:string,message:string}}}
 */
function validateMove (gameState, player, row, col) {
  if (gameState.state !== GAME_STATES.ACTIVE) {
    return { valid: false, error: createError('error:game:notActive', ERROR_MESSAGES.notActive) }
  }

  if (gameState.currentPlayer !== player) {
    return { valid: false, error: createError('error:game:notYourTurn', ERROR_MESSAGES.notYourTurn) }
  }

  if (typeof gameState.isActionLocked === 'function' && gameState.isActionLocked()) {
    return { valid: false, error: createError('error:game:notYourTurn', ERROR_MESSAGES.waitExplosions) }
  }

  if (!gameState.board.isValidPosition(row, col)) {
    return { valid: false, error: createError('error:game:invalidCell', ERROR_MESSAGES.invalidCell) }
  }

  const owner = gameState.board.getOwner(row, col)
  if (owner !== null && owner !== player) {
    return { valid: false, error: createError('error:game:invalidMove', ERROR_MESSAGES.invalidMove) }
  }

  return { valid: true }
}

/**
 * Apply a move when validation succeeds.
 * @param {import('./game-state').GameState} gameState
 * @param {number} player
 * @param {number} row
 * @param {number} col
 * @returns {{valid:boolean,error?:{code:string,message:string},cell?:{player:number,atoms:number},row?:number,col?:number,player?:number}}
 */
function applyMove (gameState, player, row, col) {
  const result = validateMove(gameState, player, row, col)
  if (!result.valid) {
    return result
  }

  const cell = gameState.board.placeAtom(player, row, col)
  return {
    valid: true,
    cell,
    row,
    col,
    player
  }
}

module.exports = {
  ERROR_MESSAGES,
  validateMove,
  applyMove
}
