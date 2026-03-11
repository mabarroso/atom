const { Board } = require('./game-board')
const {
  DEFAULT_BOARD_SIZE,
  PLAYER_COLORS
} = require('./constants')

const GAME_STATES = {
  SETUP: 'SETUP',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED'
}

/**
 * Build a unique game identifier.
 * @returns {string}
 */
function createGameId () {
  return `game-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Aggregate game state container.
 */
class GameState {
  constructor ({ gameId, roomId, boardSize = DEFAULT_BOARD_SIZE, players = {}, machineMode = false } = {}) {
    this.gameId = gameId || createGameId()
    this.roomId = roomId || this.gameId
    this.board = new Board(boardSize)
    this.machineMode = machineMode
    this.state = GAME_STATES.SETUP
    this.currentPlayer = 1
    this.winner = null
    this.winReason = null
    this.roundNumber = 1
    this.turn = 1
    this.atomCountersVisible = false
    this.moveHistory = []
    this.lastActivityAt = Date.now()
    this.players = {
      1: {
        id: 1,
        name: players[1]?.name || 'Jugador 1',
        color: PLAYER_COLORS[1],
        isHuman: players[1]?.isHuman ?? true,
        connected: players[1]?.connected ?? false,
        socketId: players[1]?.socketId || null
      },
      2: {
        id: 2,
        name: players[2]?.name || (machineMode ? 'Machine' : 'Jugador 2'),
        color: PLAYER_COLORS[2],
        isHuman: players[2]?.isHuman ?? !machineMode,
        connected: players[2]?.connected ?? machineMode,
        socketId: players[2]?.socketId || null
      }
    }
  }

  /**
   * Transition game into ACTIVE state.
   */
  start () {
    this.state = GAME_STATES.ACTIVE
    this.currentPlayer = 1
    this.roundNumber = 1
    this.turn = 1
    this.atomCountersVisible = false
    this.lastActivityAt = Date.now()
  }

  /**
   * End game with winner and reason.
   * @param {number} winner
   * @param {string} reason
   */
  end (winner, reason = 'win') {
    this.state = GAME_STATES.ENDED
    this.winner = winner
    this.winReason = reason
    this.lastActivityAt = Date.now()
  }

  switchTurn () {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1
    this.turn += 1
    if (this.currentPlayer === 1) {
      this.roundNumber += 1
    }
    this.lastActivityAt = Date.now()
    return this.currentPlayer
  }

  setPlayerConnected (playerId, connected, socketId = null) {
    if (!this.players[playerId]) {
      return
    }

    if (this.machineMode && playerId === 2 && this.players[2].isHuman === false) {
      this.players[2].connected = true
      this.players[2].socketId = null
      this.lastActivityAt = Date.now()
      return
    }

    this.players[playerId].connected = connected
    this.players[playerId].socketId = connected ? socketId : null
    this.lastActivityAt = Date.now()
  }

  appendMove ({ player, row, col, animationSequence = [] }) {
    this.moveHistory.push({
      player,
      row,
      col,
      turn: this.turn,
      animationSequence,
      timestamp: Date.now()
    })
    this.lastActivityAt = Date.now()
  }

  getAtomCounters () {
    let playerOneAtoms = 0
    let playerTwoAtoms = 0

    for (const row of this.board.cells) {
      for (const cell of row) {
        if (cell.player === 1) {
          playerOneAtoms += cell.atoms
        }

        if (cell.player === 2) {
          playerTwoAtoms += cell.atoms
        }
      }
    }

    return {
      player1: playerOneAtoms,
      player2: playerTwoAtoms,
      total: playerOneAtoms + playerTwoAtoms
    }
  }

  revealAtomCounters () {
    this.atomCountersVisible = true
    this.lastActivityAt = Date.now()
  }

  getHistory () {
    return [...this.moveHistory]
  }

  /**
   * Determine winner after enough moves.
   * @returns {number|null}
   */
  checkWinner () {
    let playerOneAtoms = 0
    let playerTwoAtoms = 0

    for (const row of this.board.cells) {
      for (const cell of row) {
        if (cell.player === 1) {
          playerOneAtoms += cell.atoms
        }

        if (cell.player === 2) {
          playerTwoAtoms += cell.atoms
        }
      }
    }

    const hasMinimumMoves = this.moveHistory.length >= 2
    if (!hasMinimumMoves) {
      return null
    }

    if (playerOneAtoms > 0 && playerTwoAtoms === 0) {
      return 1
    }

    if (playerTwoAtoms > 0 && playerOneAtoms === 0) {
      return 2
    }

    return null
  }

  toJSON () {
    return {
      gameId: this.gameId,
      roomId: this.roomId,
      machineMode: this.machineMode,
      state: this.state,
      currentPlayer: this.currentPlayer,
      winner: this.winner,
      winReason: this.winReason,
      turn: this.turn,
      roundNumber: this.roundNumber,
      atomCountersVisible: this.atomCountersVisible,
      atomCounters: this.getAtomCounters(),
      players: this.players,
      board: this.board.toJSON(),
      moveHistory: this.getHistory(),
      lastActivityAt: this.lastActivityAt
    }
  }
}

module.exports = {
  GameState,
  GAME_STATES,
  createGameId
}
