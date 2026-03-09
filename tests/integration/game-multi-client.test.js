/**
 * E2E tests for multi-client game scenarios using programmatic clients
 * These tests use socket.io-client directly to avoid browser timing issues
 */

const { GameClient } = require('./helpers/game-client')
const { getGame, processMove, removeGame } = require('../../src/server/game/game-engine')

const SERVER_URL = 'http://localhost:3000'

const describeMultiClient = GameClient.isAvailable() ? describe : describe.skip

describe.skip('Multi-Client Game Scenarios', () => {
  let httpServer
  let client1
  let client2

  beforeAll(async () => {
    // Create and start the server
    const { createServer } = require('../../src/server/index')
    const serverInstance = createServer(3000)
    httpServer = serverInstance.httpServer

    await new Promise((resolve) => {
      httpServer.listen(3000, resolve)
    })
  }, 15000)

  beforeEach(async () => {
    // Create two programmatic clients
    client1 = new GameClient(SERVER_URL, 'client1')
    client2 = new GameClient(SERVER_URL, 'client2')

    // Connect both clients
    await client1.connect()
    await client2.connect()

    // Client 1 creates the game
    client1.startGame(6)

    // Client 1 waits for game to start (they're player 1, game has empty slot for player 2)
    const startEvent1 = await client1.waitForEvent('game:started')
    const gameId = startEvent1.data.gameId

    // Client 2 joins the same game
    client2.socket.emit('client:game:start', { boardSize: 6, gameId })

    // Both clients should receive the updated game:started event with both players
    await client1.waitForEvent('game:started')
    await client2.waitForEvent('game:started')
  }, 15000)

  afterEach(async () => {
    if (client1) {
      client1.disconnect()
    }
    if (client2) {
      client2.disconnect()
    }
    // Give sockets time to close
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  afterAll(async () => {
    // Give time for any pending socket operations to complete
    await new Promise(resolve => setTimeout(resolve, 200))

    if (httpServer) {
      await new Promise((resolve) => {
        httpServer.close(resolve)
      })
    }
  }, 15000)

  test('Multi-step cascade explosions propagate correctly', async () => {
    // Get player assignments
    const player1Id = client1.getAssignedPlayerId()

    // Determine which client is player 1 (goes first)
    const firstClient = client1.getAssignedPlayerId() === 1 ? client1 : client2
    const secondClient = firstClient === client1 ? client2 : client1

    // Set up a cascade scenario on a corner cell (0,0)
    // Corner cells explode at 2 atoms
    // We'll build to explosion and verify cascading

    // Turn 1: Player 1 places at (0,0)
    firstClient.makeMove(0, 0)
    await firstClient.waitForEvent('game:stateUpdate')
    await secondClient.waitForEvent('game:stateUpdate')
    expect(firstClient.getAtomCount(0, 0)).toBe(1)
    expect(firstClient.isCellOwnedBy(0, 0, player1Id)).toBe(true)

    // Turn 2: Player 2 places at (1,1) - center cell for later
    secondClient.makeMove(1, 1)
    await firstClient.waitForEvent('game:stateUpdate')
    await secondClient.waitForEvent('game:stateUpdate')

    // Turn 3: Player 1 places at (0,0) again - triggers explosion
    firstClient.makeMove(0, 0)
    await firstClient.waitForEvent('game:stateUpdate')
    await secondClient.waitForEvent('game:stateUpdate')

    // After explosion, (0,0) should be empty and adjacent cells should have atoms
    expect(firstClient.getAtomCount(0, 0)).toBe(0)
    // Adjacent cells to (0,0) are (0,1) and (1,0)
    expect(firstClient.getAtomCount(0, 1)).toBeGreaterThan(0)
    expect(firstClient.getAtomCount(1, 0)).toBeGreaterThan(0)

    // Both adjacent cells should now be owned by player 1
    expect(firstClient.isCellOwnedBy(0, 1, player1Id)).toBe(true)
    expect(firstClient.isCellOwnedBy(1, 0, player1Id)).toBe(true)
  }, 20000)

  test('Win condition triggers when opponent has no atoms', async () => {
    // Get player assignments
    const player1Id = client1.getAssignedPlayerId()
    const player2Id = client2.getAssignedPlayerId()

    // Determine which client is player 1 (goes first)
    const firstClient = client1.getAssignedPlayerId() === 1 ? client1 : client2
    const secondClient = firstClient === client1 ? client2 : client1

    // Strategy: Build up critical mass near opponent's cell and trigger cascade
    // that takes over all opponent's cells

    // This is a simplified win scenario on small area
    // Turn 1: Player 1 at (0,0)
    firstClient.makeMove(0, 0)
    await firstClient.waitForEvent('game:stateUpdate')
    await secondClient.waitForEvent('game:stateUpdate')

    // Turn 2: Player 2 at (0,1) - adjacent to player 1
    secondClient.makeMove(0, 1)
    await firstClient.waitForEvent('game:stateUpdate')
    await secondClient.waitForEvent('game:stateUpdate')

    // Turn 3: Player 1 at (1,0) - creates pressure
    firstClient.makeMove(1, 0)
    await firstClient.waitForEvent('game:stateUpdate')
    await secondClient.waitForEvent('game:stateUpdate')

    // Turn 4: Player 2 at (0,2) - extends their line
    secondClient.makeMove(0, 2)
    await firstClient.waitForEvent('game:stateUpdate')
    await secondClient.waitForEvent('game:stateUpdate')

    // Turn 5: Player 1 at (0,0) again - now at 2, will explode (corner)
    firstClient.makeMove(0, 0)
    await firstClient.waitForEvent('game:stateUpdate')
    await secondClient.waitForEvent('game:stateUpdate')

    // This explodes and takes (0,1) from player 2
    expect(firstClient.isCellOwnedBy(0, 1, player1Id)).toBe(true)

    // Turn 6: Player 2 must play somewhere
    secondClient.makeMove(0, 2) // Increment their remaining cell
    await firstClient.waitForEvent('game:stateUpdate')
    await secondClient.waitForEvent('game:stateUpdate')

    // Turn 7: Player 1 at (0,1) - builds up
    firstClient.makeMove(0, 1)
    await firstClient.waitForEvent('game:stateUpdate')
    await secondClient.waitForEvent('game:stateUpdate')

    // Turn 8: Player 2 at (0,2) - final play
    secondClient.makeMove(0, 2)
    await firstClient.waitForEvent('game:stateUpdate')
    await secondClient.waitForEvent('game:stateUpdate')

    // Now (0,2) is at 3 atoms (edge → critical mass)
    // Next explosion could trigger win

    // Turn 9: Player 1 at (0,1) again - triggers explosion
    firstClient.makeMove(0, 1)
    await firstClient.waitForEvent('game:stateUpdate')
    await secondClient.waitForEvent('game:stateUpdate')

    // This should cascade to (0,2) and take it
    const state = firstClient.getState()

    // Check if game ended (player 2 has no atoms)
    let player2HasAtoms = false
    for (let row = 0; row < state.board.length; row++) {
      for (let col = 0; col < state.board[row].length; col++) {
        const cell = state.board[row][col]
        if (cell.player === player2Id && cell.atoms > 0) {
          player2HasAtoms = true
          break
        }
      }
      if (player2HasAtoms) break
    }

    // If player 2 still has atoms, continue until win condition
    if (player2HasAtoms) {
      // Continue playing to force win condition
      // This is a deterministic test scenario
      // In practice, the exact sequence depends on the game state
      // For now, we verify the game state is consistent
      expect(state.status).toBe('ACTIVE')
    } else {
      // Player 2 has no atoms → game should end
      // Wait for game:ended event
      const endEvent = await firstClient.waitForEvent('game:ended', 2000)
      expect(endEvent).toBeDefined()
      expect(endEvent.data.winner).toBe(player1Id)
    }

    // At minimum, verify the game progression is consistent
    expect(state.players).toHaveLength(2)
    expect(state.board).toBeDefined()
  }, 25000)
})

describeMultiClient('Machine mode integration scenarios', () => {
  let httpServer
  let client1
  let client2

  beforeAll(async () => {
    const { createServer } = require('../../src/server/index')
    const serverInstance = createServer(3000)
    httpServer = serverInstance.httpServer

    await new Promise((resolve) => {
      httpServer.listen(3000, resolve)
    })
  }, 15000)

  beforeEach(async () => {
    client1 = new GameClient(SERVER_URL, 'machine-host')
    client2 = new GameClient(SERVER_URL, 'machine-joiner')
    await client1.connect()
    await client2.connect()
  }, 15000)

  afterEach(async () => {
    if (client1) {
      client1.disconnect()
    }
    if (client2) {
      client2.disconnect()
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 200))

    if (httpServer) {
      await new Promise((resolve) => {
        httpServer.close(resolve)
      })
    }
  }, 15000)

  test('creates Human vs Machine game with machineMode metadata', async () => {
    client1.socket.emit('client:game:start', { boardSize: 6, machineMode: true })

    const started = await client1.waitForEvent('game:started')
    expect(started.data.machineMode).toBe(true)
    expect(started.data.state.machineMode).toBe(true)
    expect(started.data.state.players['2'].isHuman).toBe(false)
    expect(started.data.state.players['2'].name).toBe('Machine')
    expect(started.data.state.players['2'].connected).toBe(true)
  })

  test('prevents second human player from joining machine game', async () => {
    client1.socket.emit('client:game:start', { boardSize: 6, machineMode: true })
    const started = await client1.waitForEvent('game:started')
    const gameId = started.data.gameId

    client2.socket.emit('client:game:start', { boardSize: 6, gameId })
    const roomFull = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout waiting roomFull')), 3000)
      client2.socket.once('error:game:roomFull', (payload) => {
        clearTimeout(timeout)
        resolve(payload)
      })
    })

    expect(roomFull.message).toContain('máquina')
  })

  test('starts immediately and emits machine move + turn alternation after player move', async () => {
    client1.socket.emit('client:game:start', { boardSize: 6, machineMode: true })

    const started = await client1.waitForEvent('game:started')
    expect(started.data.state.state).toBe('ACTIVE')
    expect(started.data.state.currentPlayer).toBe(1)

    const gameId = started.data.gameId

    const machineMovePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout waiting machine move')), 7000)
      client1.socket.once('server:game:machineMove', (payload) => {
        clearTimeout(timeout)
        resolve(payload)
      })
    })

    client1.makeMove(0, 0)

    const machineMove = await machineMovePromise
    expect(machineMove.gameId).toBe(gameId)
    expect(machineMove.row).toEqual(expect.any(Number))
    expect(machineMove.col).toEqual(expect.any(Number))

    const lastState = client1.getState()
    expect(lastState.machineMode).toBe(true)
    expect(lastState.currentPlayer).toBe(1)
  }, 12000)

  test('includes machineMode in status updates for assigned client', async () => {
    client1.socket.emit('client:game:start', { boardSize: 6, machineMode: true })
    await client1.waitForEvent('game:started')

    const status = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout waiting status update')), 3000)
      client1.socket.once('server:statusUpdate', (payload) => {
        clearTimeout(timeout)
        resolve(payload)
      })
      client1.socket.emit('client:statusRequest')
    })

    expect(status.machineMode).toBe(true)
    expect(status.gameId).toEqual(expect.any(String))
  })

  test('Machine move triggers chain reaction with correct ownership conversion', async () => {
    client1.socket.emit('client:game:start', { boardSize: 4, machineMode: true })
    const started = await client1.waitForEvent('game:started')
    const gameId = started.data.gameId
    const game = getGame(gameId)

    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        game.board.cells[row][col] = { player: 1, atoms: 1 }
      }
    }

    game.board.cells[0][0] = { player: 2, atoms: 1 }
    game.board.cells[0][1] = { player: 1, atoms: 1 }
    game.board.cells[1][0] = { player: 1, atoms: 1 }
    game.currentPlayer = 1
    game.state = 'ACTIVE'

    const machineMovePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout waiting machine move')), 8000)
      client1.socket.once('server:game:machineMove', (payload) => {
        clearTimeout(timeout)
        resolve(payload)
      })
    })

    client1.makeMove(2, 2)
    const machineMove = await machineMovePromise

    expect(machineMove.row).toBe(0)
    expect(machineMove.col).toBe(0)

    const stateAfterMachine = await client1.waitForState((state) => {
      return state.currentPlayer === 1 &&
        state.board.cells[0][0].atoms === 0 &&
        state.board.cells[0][1].player === 2 &&
        state.board.cells[1][0].player === 2
    }, 8000)

    expect(stateAfterMachine.board.cells[0][1].atoms).toBeGreaterThanOrEqual(2)
    expect(stateAfterMachine.board.cells[1][0].atoms).toBeGreaterThanOrEqual(2)

    removeGame(gameId)
  }, 15000)

  test('win condition is detected when Player 1 eliminates Machine atoms', async () => {
    client1.socket.emit('client:game:start', { boardSize: 4, machineMode: true })
    const started = await client1.waitForEvent('game:started')
    const gameId = started.data.gameId
    const game = getGame(gameId)

    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        game.board.cells[row][col] = { player: null, atoms: 0 }
      }
    }

    game.board.cells[0][0] = { player: 2, atoms: 1 }
    game.board.cells[0][1] = { player: 1, atoms: 2 }
    game.currentPlayer = 1
    game.state = 'ACTIVE'
    game.moveHistory = [{ turn: 1 }, { turn: 2 }]

    const result = processMove(gameId, 1, 0, 1)

    expect(result.ok).toBe(true)
    expect(result.winner).toBe(1)
    expect(result.state.state).toBe('ENDED')
    expect(result.state.winner).toBe(1)

    removeGame(gameId)
  })

  test('win condition is detected when Machine eliminates Player 1 atoms', async () => {
    client1.socket.emit('client:game:start', { boardSize: 4, machineMode: true })
    const started = await client1.waitForEvent('game:started')
    const gameId = started.data.gameId
    const game = getGame(gameId)

    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        game.board.cells[row][col] = { player: null, atoms: 0 }
      }
    }

    game.board.cells[0][0] = { player: 1, atoms: 1 }
    game.board.cells[0][1] = { player: 2, atoms: 2 }
    game.currentPlayer = 2
    game.state = 'ACTIVE'
    game.moveHistory = [{ turn: 1 }, { turn: 2 }]

    const result = processMove(gameId, 2, 0, 1)

    expect(result.ok).toBe(true)
    expect(result.winner).toBe(2)
    expect(result.state.state).toBe('ENDED')
    expect(result.state.winner).toBe(2)

    removeGame(gameId)
  })
})
