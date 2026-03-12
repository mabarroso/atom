const { Board } = require('../../../../src/server/game/game-board')
const {
  detectExplosions,
  resolveExplosion,
  resolveCascade
} = require('../../../../src/server/game/chain-reactions')

describe('chain-reactions', () => {
  function placeAtoms (board, player, row, col, count) {
    for (let index = 0; index < count; index += 1) {
      board.placeAtom(player, row, col)
    }
  }

  test('detects explosions at critical mass', () => {
    const board = new Board(6)
    board.placeAtom(1, 0, 0)
    board.placeAtom(1, 0, 0)

    const exploding = detectExplosions(board)
    expect(exploding).toEqual([{ row: 0, col: 0 }])
  })

  test('distributes atoms to adjacent cells and retains overflow in source cell', () => {
    const board = new Board(6)
    placeAtoms(board, 1, 0, 0, 3)

    const affected = resolveExplosion(board, 0, 0, 1)
    expect(affected.affectedCells).toHaveLength(2)
    expect(board.getAtomCount(0, 0)).toBe(1)
    expect(board.getOwner(0, 0)).toBe(1)
    expect(board.getAtomCount(0, 1)).toBe(1)
    expect(board.getAtomCount(1, 0)).toBe(1)
  })

  test('clears source owner when no overflow remains after explosion', () => {
    const board = new Board(6)
    placeAtoms(board, 1, 0, 0, 2)

    resolveExplosion(board, 0, 0, 1)

    expect(board.getAtomCount(0, 0)).toBe(0)
    expect(board.getOwner(0, 0)).toBeNull()
  })

  test('resolves cascades with deterministic events and per-step board snapshots', () => {
    const board = new Board(4)
    placeAtoms(board, 1, 1, 1, 9)

    const result = resolveCascade(board, 1)
    expect(result.events.length).toBeGreaterThanOrEqual(2)
    expect(result.animationSequence.length).toBe(result.events.length)
    expect(result.events[0].sourceCell.atoms).toBeGreaterThan(0)
    expect(result.animationSequence[0].board).toBeDefined()
    expect(result.animationSequence[0].board.cells).toBeDefined()
  })

  test('produces deterministic intermediate overflow states for identical cascades', () => {
    const firstBoard = new Board(4)
    const secondBoard = new Board(4)

    placeAtoms(firstBoard, 1, 1, 1, 9)
    placeAtoms(secondBoard, 1, 1, 1, 9)

    const first = resolveCascade(firstBoard, 1)
    const second = resolveCascade(secondBoard, 1)

    const toStableProjection = (sequence) => {
      return sequence.map((step) => ({
        row: step.row,
        col: step.col,
        sourceAtoms: step.sourceCell?.atoms,
        sourcePlayer: step.sourceCell?.player,
        snapshotSourceAtoms: step.board.cells[step.row][step.col].atoms
      }))
    }

    expect(toStableProjection(first.animationSequence)).toEqual(toStableProjection(second.animationSequence))
  })
})
