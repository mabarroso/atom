const { GameState, GAME_STATES } = require('../../../../src/server/game/game-state')

describe('GameState', () => {
  test('starts and transitions states', () => {
    const game = new GameState()
    expect(game.state).toBe(GAME_STATES.SETUP)

    game.start()
    expect(game.state).toBe(GAME_STATES.ACTIVE)

    game.end(1)
    expect(game.state).toBe(GAME_STATES.ENDED)
    expect(game.winner).toBe(1)
  })

  test('switches turns', () => {
    const game = new GameState()
    game.start()

    expect(game.currentPlayer).toBe(1)
    game.switchTurn()
    expect(game.currentPlayer).toBe(2)
    game.switchTurn()
    expect(game.currentPlayer).toBe(1)
  })

  test('tracks move history', () => {
    const game = new GameState()
    game.start()
    game.appendMove({ player: 1, row: 0, col: 0, animationSequence: [] })

    expect(game.getHistory()).toHaveLength(1)
    expect(game.getHistory()[0].player).toBe(1)
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
