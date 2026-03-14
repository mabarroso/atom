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

  test('returns animation sequence steps with post-step board snapshots', () => {
    const game = createGame(null, 6)
    processMove(game.gameId, 1, 1, 1)
    processMove(game.gameId, 2, 0, 0)
    processMove(game.gameId, 1, 1, 1)
    processMove(game.gameId, 2, 0, 1)
    const result = processMove(game.gameId, 1, 1, 1)

    expect(result.ok).toBe(true)
    expect(Array.isArray(result.animationSequence)).toBe(true)

    if (result.animationSequence.length > 0) {
      expect(result.animationSequence[0].board).toBeDefined()
      expect(result.animationSequence[0].board.cells).toBeDefined()
    }
  })

  test('defers turn handoff while explosion cascade completion is pending', () => {
    const game = createGame(null, 6)

    game.board.placeAtom(1, 1, 1)
    game.board.placeAtom(1, 1, 1)
    game.board.placeAtom(1, 1, 1)

    const result = processMove(game.gameId, 1, 1, 1)

    expect(result.ok).toBe(true)
    expect(result.pendingTurn).toBeDefined()
    expect(result.state.currentPlayer).toBe(1)
    expect(result.state.actionLockedUntil).toBeGreaterThan(Date.now())
  })

  test('keeps roundNumber after player 1 valid move and increments after player 2 valid move', () => {
    const game = createGame(null, 6)

    const resultPlayerOne = processMove(game.gameId, 1, 0, 0)
    expect(resultPlayerOne.ok).toBe(true)
    expect(resultPlayerOne.state.roundNumber).toBe(1)

    const resultPlayerTwo = processMove(game.gameId, 2, 0, 1)
    expect(resultPlayerTwo.ok).toBe(true)
    expect(resultPlayerTwo.state.roundNumber).toBe(2)
  })

  test('keeps roundNumber unchanged on invalid move', () => {
    const game = createGame(null, 6)

    const invalidResult = processMove(game.gameId, 2, 0, 0)
    expect(invalidResult.ok).toBe(false)

    const state = getGameState(game.gameId)
    expect(state.roundNumber).toBe(1)
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
