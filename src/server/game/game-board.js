const {
  DEFAULT_BOARD_SIZE,
  MIN_BOARD_SIZE,
  MAX_BOARD_SIZE
} = require('./constants')

/**
 * Board model for an NxN Atom game grid.
 */
class Board {
  constructor (size = DEFAULT_BOARD_SIZE) {
    this.size = Board.validateSize(size)
    this.cells = Array.from({ length: this.size }, () => {
      return Array.from({ length: this.size }, () => ({ player: null, atoms: 0 }))
    })
  }

  /**
   * Validate board size boundaries.
   * @param {number} size
   * @returns {number}
   */
  static validateSize (size) {
    const parsedSize = Number(size)
    if (!Number.isInteger(parsedSize) || parsedSize < MIN_BOARD_SIZE || parsedSize > MAX_BOARD_SIZE) {
      throw new Error(`Board size must be an integer between ${MIN_BOARD_SIZE} and ${MAX_BOARD_SIZE}`)
    }

    return parsedSize
  }

  isValidPosition (row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size
  }

  getCell (row, col) {
    if (!this.isValidPosition(row, col)) {
      return null
    }

    return this.cells[row][col]
  }

  /**
   * Retrieve orthogonal adjacent cells.
   * @param {number} row
   * @param {number} col
   * @returns {{row:number,col:number}[]}
   */
  getAdjacentCells (row, col) {
    const candidates = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 }
    ]

    return candidates.filter((position) => this.isValidPosition(position.row, position.col))
  }

  /**
   * Critical mass equals adjacent neighbor count.
   * @param {number} row
   * @param {number} col
   * @returns {number}
   */
  getCriticalMass (row, col) {
    const neighbors = this.getAdjacentCells(row, col)
    return neighbors.length
  }

  isEmpty (row, col) {
    const cell = this.getCell(row, col)
    return !cell || cell.atoms === 0
  }

  getOwner (row, col) {
    const cell = this.getCell(row, col)
    return cell ? cell.player : null
  }

  getAtomCount (row, col) {
    const cell = this.getCell(row, col)
    return cell ? cell.atoms : 0
  }

  placeAtom (player, row, col) {
    if (!this.isValidPosition(row, col)) {
      throw new Error('Invalid cell coordinates')
    }

    const cell = this.cells[row][col]
    cell.atoms += 1
    cell.player = player

    return { player: cell.player, atoms: cell.atoms }
  }

  toJSON () {
    return {
      size: this.size,
      cells: this.cells.map((row) => row.map((cell) => ({ ...cell })))
    }
  }

  static fromJSON (data) {
    const board = new Board(data.size)
    board.cells = data.cells.map((row) => row.map((cell) => ({
      player: cell.player === undefined ? null : cell.player,
      atoms: Number(cell.atoms) || 0
    })))
    return board
  }
}

module.exports = {
  Board
}
