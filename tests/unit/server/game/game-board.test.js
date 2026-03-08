const { Board } = require('../../../../src/server/game/game-board')

describe('Board', () => {
  test('creates default 6x6 board', () => {
    const board = new Board()
    expect(board.size).toBe(6)
    expect(board.cells).toHaveLength(6)
    expect(board.cells[0]).toHaveLength(6)
  })

  test('validates board size range', () => {
    expect(() => new Board(3)).toThrow()
    expect(() => new Board(11)).toThrow()
    expect(() => new Board(8)).not.toThrow()
  })

  test('returns adjacent cells for corner edge center', () => {
    const board = new Board(6)
    expect(board.getAdjacentCells(0, 0)).toHaveLength(2)
    expect(board.getAdjacentCells(0, 3)).toHaveLength(3)
    expect(board.getAdjacentCells(3, 3)).toHaveLength(4)
  })

  test('returns critical mass by position', () => {
    const board = new Board(6)
    expect(board.getCriticalMass(0, 0)).toBe(2)
    expect(board.getCriticalMass(0, 2)).toBe(3)
    expect(board.getCriticalMass(2, 2)).toBe(4)
  })

  test('serializes and deserializes board state', () => {
    const board = new Board(6)
    board.placeAtom(1, 0, 0)
    const serialized = board.toJSON()
    const restored = Board.fromJSON(serialized)

    expect(restored.size).toBe(6)
    expect(restored.getOwner(0, 0)).toBe(1)
    expect(restored.getAtomCount(0, 0)).toBe(1)
  })
})
