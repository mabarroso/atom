const { GameState } = require('../../../../src/server/game/game-state')
const { validateMove, applyMove } = require('../../../../src/server/game/player-actions')

describe('player-actions', () => {
  test('validates moves by turn and ownership', () => {
    const game = new GameState()
    game.start()

    expect(validateMove(game, 1, 0, 0).valid).toBe(true)
    expect(validateMove(game, 2, 0, 0).valid).toBe(false)

    game.board.placeAtom(2, 0, 1)
    expect(validateMove(game, 1, 0, 1).valid).toBe(false)
  })

  test('applies valid move to empty cell', () => {
    const game = new GameState()
    game.start()

    const result = applyMove(game, 1, 0, 0)
    expect(result.valid).toBe(true)
    expect(game.board.getAtomCount(0, 0)).toBe(1)
    expect(game.board.getOwner(0, 0)).toBe(1)
  })
})
