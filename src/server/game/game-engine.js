const { GameState, GAME_STATES } = require('./game-state')
const { applyMove } = require('./player-actions')
const { resolveCascade } = require('./chain-reactions')
const { selectMove } = require('./machine-player')
const {
  DEFAULT_BOARD_SIZE,
  GAME_IDLE_TIMEOUT_MS,
  FORFEIT_TIMEOUT_MS
} = require('./constants')

const games = new Map()
const forfeitTimers = new Map()

/**
 * Create and start a game instance.
 * @param {string|null} roomId
 * @param {number} boardSize
 * @param {object} players
 * @returns {import('./game-state').GameState}
 */
function createGame (roomId, boardSize = DEFAULT_BOARD_SIZE, players = {}, options = {}) {
  const gameState = new GameState({
    roomId,
    boardSize,
    players,
    machineMode: options.machineMode === true
  })
  gameState.start()
  games.set(gameState.gameId, gameState)
  return gameState
}

function getGame (gameId) {
  return games.get(gameId) || null
}

function getGameState (gameId) {
  const game = getGame(gameId)
  return game ? game.toJSON() : null
}

function getMachinePlannedMove (gameId, difficulty = 'Medium') {
  const game = getGame(gameId)
  if (!game) {
    return null
  }

  if (!game.machineMode || game.state !== GAME_STATES.ACTIVE || game.currentPlayer !== 2) {
    return null
  }

  return selectMove(game.board.cells, game.toJSON(), difficulty)
}

function removeGame (gameId) {
  games.delete(gameId)
  if (forfeitTimers.has(gameId)) {
    clearTimeout(forfeitTimers.get(gameId))
    forfeitTimers.delete(gameId)
  }
}

/**
 * Process one move through validation, cascade, and winner detection.
 * @param {string} gameId
 * @param {number} player
 * @param {number} row
 * @param {number} col
 * @returns {{ok:boolean,error?:{code:string,message:string},state?:object,winner?:number|null,animationSequence?:Array<object>,truncated?:boolean}}
 */
function processMove (gameId, player, row, col) {
  const game = getGame(gameId)
  if (!game) {
    return {
      ok: false,
      error: {
        code: 'error:game:notFound',
        message: 'Partida no encontrada'
      }
    }
  }

  const moveResult = applyMove(game, player, row, col)
  if (!moveResult.valid) {
    return {
      ok: false,
      error: moveResult.error
    }
  }

  const cascadeResult = resolveCascade(game.board, player)
  game.appendMove({
    player,
    row,
    col,
    animationSequence: cascadeResult.animationSequence
  })

  const winner = game.checkWinner()
  if (winner) {
    game.end(winner, 'win')
  } else if (game.state === GAME_STATES.ACTIVE) {
    game.switchTurn()
  }

  return {
    ok: true,
    state: game.toJSON(),
    winner,
    animationSequence: cascadeResult.animationSequence,
    truncated: cascadeResult.truncated
  }
}

/**
 * Cleanup games that exceeded idle timeout.
 * @param {number} maxIdleMs
 * @returns {number}
 */
function cleanupIdleGames (maxIdleMs = GAME_IDLE_TIMEOUT_MS) {
  const now = Date.now()
  let removed = 0
  for (const [gameId, game] of games.entries()) {
    if (now - game.lastActivityAt > maxIdleMs) {
      removeGame(gameId)
      removed += 1
    }
  }

  return removed
}

function recoverConnection (gameId, player, socketId) {
  const game = getGame(gameId)
  if (!game) {
    return null
  }

  game.setPlayerConnected(player, true, socketId)
  if (forfeitTimers.has(gameId)) {
    clearTimeout(forfeitTimers.get(gameId))
    forfeitTimers.delete(gameId)
  }

  return game.toJSON()
}

function handleDisconnect (gameId, player, onForfeit = null) {
  const game = getGame(gameId)
  if (!game) {
    return null
  }

  if (game.machineMode && player === 2 && game.players[2]?.isHuman === false) {
    return game.toJSON()
  }

  game.setPlayerConnected(player, false)

  const timer = setTimeout(() => {
    const currentGame = getGame(gameId)
    if (!currentGame || currentGame.state !== GAME_STATES.ACTIVE) {
      return
    }

    if (!currentGame.players[player].connected) {
      const winner = player === 1 ? 2 : 1
      currentGame.end(winner, 'forfeit')
      onForfeit?.(currentGame.toJSON())
    }
  }, FORFEIT_TIMEOUT_MS)

  forfeitTimers.set(gameId, timer)
  return game.toJSON()
}

module.exports = {
  createGame,
  getGame,
  getGameState,
  getMachinePlannedMove,
  processMove,
  removeGame,
  cleanupIdleGames,
  recoverConnection,
  handleDisconnect,
  games
}
