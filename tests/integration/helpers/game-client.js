/**
 * Programmatic game client for deterministic E2E testing
 * Uses socket.io-client to create bot players without browser timing issues
 */

let ioClient = null
let socketIoClientAvailable = true

try {
  ioClient = require('socket.io-client').io
} catch {
  socketIoClientAvailable = false
}

class GameClient {
  constructor (serverUrl, playerId) {
    this.serverUrl = serverUrl
    this.playerId = playerId
    this.socket = null
    this.gameState = null
    this.events = []
  }

  /**
   * Connect to the server and wait for connection
   */
  async connect () {
    if (!socketIoClientAvailable) {
      throw new Error('socket.io-client is not installed')
    }

    return new Promise((resolve, reject) => {
      this.socket = ioClient(this.serverUrl, {
        transports: ['websocket'],
        reconnection: false
      })

      this.socket.on('connect', () => {
        this.setupEventListeners()
        resolve()
      })

      this.socket.on('connect_error', (error) => {
        reject(error)
      })

      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    })
  }

  /**
   * Set up event listeners for all game events
   */
  setupEventListeners () {
    this.socket.on('server:game:started', (data) => {
      this.gameState = data.state
      this.events.push({ type: 'game:started', data })
    })

    this.socket.on('server:game:stateUpdate', (data) => {
      this.gameState = data.state
      this.events.push({ type: 'game:stateUpdate', data })
    })

    this.socket.on('server:game:ended', (data) => {
      this.gameState = data.state
      this.events.push({ type: 'game:ended', data })
    })

    this.socket.on('error:game:invalidMove', (data) => {
      this.events.push({ type: 'error:invalidMove', data })
    })

    this.socket.on('error:game:notYourTurn', (data) => {
      this.events.push({ type: 'error:notYourTurn', data })
    })

    this.socket.on('error:game:notActive', (data) => {
      this.events.push({ type: 'error:notActive', data })
    })
  }

  /**
   * Start a new game
   */
  startGame (boardSize = 6) {
    this.socket.emit('client:game:start', { boardSize })
  }

  /**
   * Make a move
   */
  makeMove (row, col) {
    this.socket.emit('client:game:move', { row, col })
  }

  updateTiming (payload) {
    this.socket.emit('client:game:updateTiming', payload)
  }

  /**
   * Wait for a specific event type
   * @param {string} eventType - Event type to wait for
   * @param {number} timeout - Timeout in ms (default 5000)
   * @returns {Promise<object>} Event data
   */
  async waitForEvent (eventType, timeout = 5000) {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const event = this.events.find(e => e.type === eventType)
      if (event) {
        // Remove from events queue
        this.events = this.events.filter(e => e !== event)
        return event
      }
      await this.sleep(50)
    }

    throw new Error(`Timeout waiting for event: ${eventType}`)
  }

  /**
   * Wait for game state to match a condition
   * @param {Function} condition - Function that receives gameState and returns boolean
   * @param {number} timeout - Timeout in ms (default 5000)
   */
  async waitForState (condition, timeout = 5000) {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      if (this.gameState && condition(this.gameState)) {
        return this.gameState
      }
      await this.sleep(50)
    }

    throw new Error('Timeout waiting for game state condition')
  }

  /**
   * Get current game state
   */
  getState () {
    return this.gameState
  }

  /**
   * Get current player (whose turn it is)
   */
  getCurrentPlayer () {
    return this.gameState?.currentPlayer
  }

  /**
   * Get assigned player ID for this client
   */
  getAssignedPlayerId () {
    if (!this.gameState || !this.gameState.players) {
      return null
    }

    // players is an object with keys 1 and 2
    for (const playerId in this.gameState.players) {
      if (this.gameState.players[playerId].socketId === this.socket.id) {
        return Number(playerId)
      }
    }

    return null
  }

  /**
   * Get cell state at row, col
   */
  getCell (row, col) {
    if (!this.gameState || !this.gameState.board) {
      return null
    }
    const boardCells = this.gameState.board.cells || this.gameState.board
    if (!boardCells[row]) {
      return null
    }
    return boardCells[row][col]
  }

  /**
   * Check if cell is owned by a player
   */
  isCellOwnedBy (row, col, playerId) {
    const cell = this.getCell(row, col)
    if (!cell) {
      return false
    }
    return cell.player === playerId
  }

  /**
   * Get atom count at cell
   */
  getAtomCount (row, col) {
    const cell = this.getCell(row, col)
    if (!cell) {
      return 0
    }
    return cell.atoms || 0
  }

  /**
   * Disconnect from server
   */
  disconnect () {
    if (this.socket) {
      this.socket.disconnect()
    }
  }

  /**
   * Utility sleep function
   */
  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  static isAvailable () {
    return socketIoClientAvailable
  }
}

module.exports = { GameClient }
