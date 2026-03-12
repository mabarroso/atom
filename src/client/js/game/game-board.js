import { PLAYER_COLORS } from './constants.js'

function describeCell (row, col, cell) {
  if (!cell || cell.atoms === 0) {
    return `Celda fila ${row + 1} columna ${col + 1}, vacía`
  }

  const atomLabel = cell.atoms === 1 ? 'átomo' : 'átomos'
  return `Celda fila ${row + 1} columna ${col + 1}, ${cell.atoms} ${atomLabel}, Jugador ${cell.player}`
}

function buildAtomVisual (atoms) {
  if (atoms <= 0) {
    return null
  }

  if (atoms <= 4) {
    return {
      layout: atoms,
      visibleAtoms: atoms,
      totalLabel: null,
      overflow: false
    }
  }

  return {
    layout: 3,
    visibleAtoms: 3,
    totalLabel: String(atoms),
    overflow: true
  }
}

/**
 * Build board renderer and interaction handlers.
 * @param {HTMLElement} container
 * @param {{onMove?:function}} options
 * @returns {{render:function,flashExplosion:function,flashTransfer:function}}
 */
export function createGameBoard (container, { onMove } = {}) {
  function render (state) {
    const size = state.board.size
    const boardCells = state.board.cells
    const lastMoveCellId = state.lastMoveCellId || null

    container.style.setProperty('--board-size', size)
    container.innerHTML = ''

    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const cell = boardCells[row][col]
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'game-cell'
        button.dataset.row = String(row)
        button.dataset.col = String(col)
        button.setAttribute('aria-label', describeCell(row, col, cell))

        if (lastMoveCellId === `${row}:${col}`) {
          button.classList.add('is-last-move')
        }

        if (cell.player) {
          button.style.setProperty('--cell-color', PLAYER_COLORS[cell.player])
          button.classList.add(`player-${cell.player}`)
        }

        if (cell.atoms > 0) {
          const atomVisual = buildAtomVisual(cell.atoms)
          const atomsWrap = document.createElement('span')
          atomsWrap.className = `atoms-wrap atoms-layout-${atomVisual.layout}`
          if (atomVisual.overflow) {
            atomsWrap.classList.add('atoms-layout-overflow')
          }

          for (let index = 0; index < atomVisual.visibleAtoms; index += 1) {
            const atomDot = document.createElement('span')
            atomDot.className = 'atom-dot'
            atomsWrap.appendChild(atomDot)
          }

          if (atomVisual.totalLabel) {
            const atomTotal = document.createElement('span')
            atomTotal.className = 'atom-total'
            atomTotal.textContent = atomVisual.totalLabel
            atomsWrap.appendChild(atomTotal)
          }

          button.appendChild(atomsWrap)
        }

        button.addEventListener('click', () => {
          onMove?.(row, col)
        })

        button.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onMove?.(row, col)
          }

          const navigation = {
            ArrowUp: { row: row - 1, col },
            ArrowDown: { row: row + 1, col },
            ArrowLeft: { row, col: col - 1 },
            ArrowRight: { row, col: col + 1 }
          }

          const next = navigation[event.key]
          if (!next) {
            return
          }

          event.preventDefault()
          if (next.row < 0 || next.col < 0 || next.row >= size || next.col >= size) {
            return
          }

          const selector = `.game-cell[data-row="${next.row}"][data-col="${next.col}"]`
          const nextCell = container.querySelector(selector)
          nextCell?.focus()
        })

        container.appendChild(button)
      }
    }
  }

  function flashExplosion (row, col) {
    const selector = `.game-cell[data-row="${row}"][data-col="${col}"]`
    const element = container.querySelector(selector)
    if (!element) {
      return
    }

    element.classList.add('is-exploding')
    window.setTimeout(() => {
      element.classList.remove('is-exploding')
    }, 220)
  }

  function flashTransfer (row, col) {
    const selector = `.game-cell[data-row="${row}"][data-col="${col}"]`
    const element = container.querySelector(selector)
    if (!element) {
      return
    }

    element.classList.add('is-transfer')
    window.setTimeout(() => {
      element.classList.remove('is-transfer')
    }, 220)
  }

  return {
    render,
    flashExplosion,
    flashTransfer
  }
}
