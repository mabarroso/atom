const path = require('path')
const { pathToFileURL } = require('url')

describe('game-state-manager', () => {
  let createGameStateManager

  beforeAll(async () => {
    const moduleUrl = pathToFileURL(path.resolve(__dirname, '../../../src/client/js/game/game-state-manager.js')).href
    ;({ createGameStateManager } = await import(moduleUrl))
  })

  function buildState (atoms = 0) {
    return {
      state: 'ACTIVE',
      currentPlayer: 1,
      players: {
        1: { id: 1, name: 'Jugador 1', connected: true },
        2: { id: 2, name: 'Jugador 2', connected: true }
      },
      board: {
        size: 4,
        cells: Array.from({ length: 4 }, (_, row) => {
          return Array.from({ length: 4 }, (_, col) => {
            if (row === 0 && col === 0) {
              return { player: atoms > 0 ? 1 : null, atoms }
            }

            return { player: null, atoms: 0 }
          })
        })
      }
    }
  }

  test('applies optimistic move and reverts on rejection', () => {
    const manager = createGameStateManager()
    manager.updateFromServer(buildState(0))

    manager.applyOptimisticMove(0, 0, 1)
    expect(manager.getState().board.cells[0][0].atoms).toBe(1)
    expect(manager.getState().board.cells[0][0].player).toBe(1)

    manager.revertOptimisticMove()
    expect(manager.getState().board.cells[0][0].atoms).toBe(0)
    expect(manager.getState().board.cells[0][0].player).toBeNull()
  })

  test('syncs authoritative server state and clears optimistic snapshot', () => {
    const manager = createGameStateManager()
    const listener = jest.fn()
    manager.subscribe(listener)

    manager.updateFromServer(buildState(0))
    manager.applyOptimisticMove(0, 0, 1)
    expect(manager.getState().board.cells[0][0].atoms).toBe(1)

    manager.updateFromServer(buildState(2))
    expect(manager.getState().board.cells[0][0].atoms).toBe(2)

    manager.revertOptimisticMove()
    expect(manager.getState().board.cells[0][0].atoms).toBe(2)
    expect(listener).toHaveBeenCalled()
  })
})
