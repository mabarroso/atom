const {
  createGame,
  getGame,
  getGameState,
  processMove,
  handleDisconnect,
  removeGame,
  games
} = require('../../../../src/server/game/game-engine')

describe('game-engine', () => {
  afterEach(() => {
    for (const gameId of games.keys()) {
      removeGame(gameId)
    }
  })

  test('creates game and returns state', () => {
    const game = createGame(null, 6)
    const state = getGameState(game.gameId)

    expect(state).toBeTruthy()
    expect(state.board.size).toBe(6)
    expect(state.state).toBe('ACTIVE')
  })

  test('processes move and updates board', () => {
    const game = createGame(null, 6)
    const result = processMove(game.gameId, 1, 0, 0)

    expect(result.ok).toBe(true)
    expect(result.state.board.cells[0][0].atoms).toBeGreaterThanOrEqual(0)
  })

  test('increments turnNumber after valid move progression', () => {
    const game = createGame(null, 6)

    const result = processMove(game.gameId, 1, 0, 0)
    expect(result.ok).toBe(true)
    expect(result.state.turnNumber).toBe(2)
  })

  test('keeps turnNumber unchanged on invalid move', () => {
    const game = createGame(null, 6)

    const invalidResult = processMove(game.gameId, 2, 0, 0)
    expect(invalidResult.ok).toBe(false)

    const state = getGameState(game.gameId)
    expect(state.turnNumber).toBe(1)
  })

  test('returns error for missing game', () => {
    const result = processMove('missing', 1, 0, 0)
    expect(result.ok).toBe(false)
    expect(result.error.code).toBe('error:game:notFound')
  })

  test('ends game by forfeit after long disconnect timeout', () => {
    jest.useFakeTimers()

    const game = createGame(null, 6, {
      1: { connected: true, socketId: 'sock-1' },
      2: { connected: true, socketId: 'sock-2' }
    })

    handleDisconnect(game.gameId, 2)
    jest.advanceTimersByTime(30001)

    const currentGame = getGame(game.gameId)
    expect(currentGame.state).toBe('ENDED')
    expect(currentGame.winner).toBe(1)
    expect(currentGame.winReason).toBe('forfeit')

    jest.useRealTimers()
  })
})
