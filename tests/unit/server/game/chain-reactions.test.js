const { Board } = require('../../../../src/server/game/game-board')
const {
  detectExplosions,
  resolveExplosion,
  resolveCascade
} = require('../../../../src/server/game/chain-reactions')

describe('chain-reactions', () => {
  test('detects explosions at critical mass', () => {
    const board = new Board(6)
    board.placeAtom(1, 0, 0)
    board.placeAtom(1, 0, 0)

    const exploding = detectExplosions(board)
    expect(exploding).toEqual([{ row: 0, col: 0 }])
  })

  test('distributes atoms to adjacent cells', () => {
    const board = new Board(6)
    board.placeAtom(1, 0, 0)
    board.placeAtom(1, 0, 0)

    const affected = resolveExplosion(board, 0, 0, 1)
    expect(affected).toHaveLength(2)
    expect(board.getAtomCount(0, 0)).toBe(0)
    expect(board.getAtomCount(0, 1)).toBe(1)
    expect(board.getAtomCount(1, 0)).toBe(1)
  })

  test('resolves cascades with deterministic events', () => {
    const board = new Board(4)
    board.placeAtom(1, 0, 0)
    board.placeAtom(1, 0, 0)

    const result = resolveCascade(board, 1)
    expect(result.events.length).toBeGreaterThan(0)
    expect(result.animationSequence.length).toBe(result.events.length)
  })
})
