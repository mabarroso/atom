const {
  selectMove,
  getCellType,
  getCriticalMass,
  getAdjacentCells,
  isAtCriticalMass
} = require('../../../../src/server/game/machine-player')

function createBoard (size = 6) {
  return Array.from({ length: size }, () => {
    return Array.from({ length: size }, () => ({ player: null, atoms: 0 }))
  })
}

describe('machine-player', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('classifies cell types correctly', () => {
    expect(getCellType(0, 0, 6)).toBe('corner')
    expect(getCellType(0, 2, 6)).toBe('edge')
    expect(getCellType(3, 3, 6)).toBe('center')
  })

  test('gets correct critical mass by cell type', () => {
    expect(getCriticalMass('corner')).toBe(2)
    expect(getCriticalMass('edge')).toBe(3)
    expect(getCriticalMass('center')).toBe(4)
  })

  test('returns adjacent cells within bounds', () => {
    expect(getAdjacentCells(0, 0, 4)).toEqual([
      { row: 1, col: 0 },
      { row: 0, col: 1 }
    ])

    expect(getAdjacentCells(1, 1, 4).length).toBe(4)
  })

  test('detects critical mass state', () => {
    expect(isAtCriticalMass({ atoms: 2 }, 'corner')).toBe(true)
    expect(isAtCriticalMass({ atoms: 1 }, 'corner')).toBe(false)
    expect(isAtCriticalMass({ atoms: 3 }, 'edge')).toBe(true)
    expect(isAtCriticalMass({ atoms: 0 }, 'center')).toBe(false)
  })

  test('selects offensive corner move when opponent adjacent is at critical mass', () => {
    const board = createBoard(4)
    board[1][0] = { player: 1, atoms: 3 }

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(Math, 'random').mockReturnValue(0)

    const move = selectMove(board, {})
    expect(move).toEqual({ row: 0, col: 0 })
    expect(logSpy).toHaveBeenCalled()
    expect(logSpy.mock.calls[0][0]).toContain('Rule: cornerOffensive1Adjacent')
  })

  test('selects tactical free corner when no higher rule applies', () => {
    const board = createBoard(4)

    jest.spyOn(Math, 'random').mockReturnValue(0)

    const move = selectMove(board, {})
    expect(move).toEqual({ row: 0, col: 0 })
  })

  test('selects edge offensive move when one adjacent opponent cell is at critical mass', () => {
    const board = createBoard(4)
    board[1][1] = { player: 1, atoms: 4 }

    jest.spyOn(Math, 'random').mockReturnValue(0)

    const move = selectMove(board, {})
    expect(move).toEqual({ row: 0, col: 1 })
  })

  test('selects offensive move when adjacent opponent cells are at critical mass', () => {
    const board = createBoard(4)
    board[0][0] = { player: 1, atoms: 1 }
    board[0][3] = { player: 1, atoms: 1 }
    board[3][0] = { player: 1, atoms: 1 }
    board[3][3] = { player: 1, atoms: 1 }
    board[0][1] = { player: 1, atoms: 3 }
    board[1][0] = { player: 1, atoms: 3 }
    board[1][2] = { player: 1, atoms: 3 }
    board[2][1] = { player: 1, atoms: 3 }

    jest.spyOn(Math, 'random').mockReturnValue(0)

    const move = selectMove(board, {})
    expect(move).toEqual(expect.objectContaining({ row: expect.any(Number), col: expect.any(Number) }))
    expect([
      '0,2',
      '1,1',
      '2,0'
    ]).toContain(`${move.row},${move.col}`)
  })

  test('selects strategic center move when adjacent opponent cells exist but are not critical', () => {
    const board = createBoard(4)
    board[0][1] = { player: 1, atoms: 1 }

    jest.spyOn(Math, 'random').mockReturnValue(0)

    const move = selectMove(board, {})
    expect(move).toEqual({ row: 1, col: 1 })
  })

  test('falls back to free cell when probabilities fail', () => {
    const board = createBoard(4)

    jest.spyOn(Math, 'random').mockReturnValue(0.9999)

    const move = selectMove(board, {})
    expect(move).toEqual({ row: 0, col: 0 })
  })

  test('returns null when no legal move exists', () => {
    const board = createBoard(4)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        board[row][col] = { player: 1, atoms: 2 }
      }
    }

    jest.spyOn(Math, 'random').mockReturnValue(0)

    const move = selectMove(board, {})
    expect(move).toBeNull()
  })
})
