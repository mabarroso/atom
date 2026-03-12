const { GameState, GAME_STATES } = require('../../../../src/server/game/game-state')

describe('GameState', () => {
  test('starts and transitions states', () => {
    const game = new GameState()
    expect(game.state).toBe(GAME_STATES.SETUP)

    game.start()
    expect(game.state).toBe(GAME_STATES.ACTIVE)
    expect(game.roundNumber).toBe(1)

    game.end(1)
    expect(game.state).toBe(GAME_STATES.ENDED)
    expect(game.winner).toBe(1)
  })

  test('switches turns', () => {
    const game = new GameState()
    game.start()

    expect(game.currentPlayer).toBe(1)
    expect(game.roundNumber).toBe(1)

    game.switchTurn()
    expect(game.currentPlayer).toBe(2)
    expect(game.roundNumber).toBe(1)

    game.switchTurn()
    expect(game.currentPlayer).toBe(1)
    expect(game.roundNumber).toBe(2)
  })

  test('tracks move history', () => {
    const game = new GameState()
    game.start()
    game.appendMove({ player: 1, row: 0, col: 0, animationSequence: [] })

    expect(game.getHistory()).toHaveLength(1)
    expect(game.getHistory()[0].player).toBe(1)
    expect(game.getHistory()[0].turn).toBe(1)
  })

  test('serializes authoritative roundNumber in state payload', () => {
    const game = new GameState()
    game.start()
    game.switchTurn()
    game.switchTurn()

    const serialized = game.toJSON()
    expect(serialized.roundNumber).toBe(2)
    expect(serialized.turn).toBe(3)
  })

  test('keeps atom counters hidden by default and reveals when requested', () => {
    const game = new GameState()
    game.start()

    expect(game.toJSON().atomCountersVisible).toBe(false)

    game.revealAtomCounters()
    expect(game.toJSON().atomCountersVisible).toBe(true)
  })

  test('serializes authoritative atom counter values from board state', () => {
    const game = new GameState()
    game.start()

    game.board.placeAtom(1, 0, 0)
    game.board.placeAtom(1, 0, 1)
    game.board.placeAtom(2, 1, 0)

    const serialized = game.toJSON()
    expect(serialized.atomCounters.player1).toBe(2)
    expect(serialized.atomCounters.player2).toBe(1)
    expect(serialized.atomCounters.total).toBe(3)
  })

  test('serializes default timing settings in state payload', () => {
    const game = new GameState()
    game.start()

    const serialized = game.toJSON()
    expect(serialized.animationDelayMs).toBe(300)
    expect(serialized.machineResponseDelayMs).toBe(100)
  })

  test('updates timing settings with bounds and steps', () => {
    const game = new GameState()
    game.start()

    game.setTimingSettings({
      animationDelayMs: 63,
      machineResponseDelayMs: -20
    })

    expect(game.toJSON().animationDelayMs).toBe(50)
    expect(game.toJSON().machineResponseDelayMs).toBe(0)

    game.setTimingSettings({
      animationDelayMs: 1500,
      machineResponseDelayMs: 5090
    })

    expect(game.toJSON().animationDelayMs).toBe(1200)
    expect(game.toJSON().machineResponseDelayMs).toBe(5000)
  })

  test('detects winner after minimum moves', () => {
    const game = new GameState()
    game.start()
    game.appendMove({ player: 1, row: 0, col: 0, animationSequence: [] })
    game.appendMove({ player: 2, row: 1, col: 1, animationSequence: [] })

    game.board.placeAtom(1, 0, 0)
    game.board.placeAtom(1, 0, 1)
    game.board.getCell(1, 1).atoms = 0
    game.board.getCell(1, 1).player = null

    expect(game.checkWinner()).toBe(1)
  })
})
