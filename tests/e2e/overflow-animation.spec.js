const { test, expect } = require('@playwright/test')

test('Retained overflow is rendered immediately after each explosion step', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#connection-status')).toContainText('Conectado')

  await page.evaluate(() => {
    const triggerClientEvent = (eventName, payload) => {
      const socket = window.__ATOM_SOCKET__
      if (!socket || !socket._callbacks) {
        return
      }

      const listeners = socket._callbacks[`$${eventName}`] || []
      listeners.forEach((listener) => listener(payload))
    }

    const emptyBoard = {
      size: 4,
      cells: Array.from({ length: 4 }, () => {
        return Array.from({ length: 4 }, () => ({ player: null, atoms: 0 }))
      })
    }

    const baseState = {
      state: 'ACTIVE',
      roomId: 'room-mock',
      roundNumber: 1,
      currentPlayer: 1,
      machineMode: false,
      atomCountersVisible: false,
      atomCounters: { player1: 0, player2: 0, total: 0 },
      players: {
        1: { id: 1, name: 'Jugador 1', connected: true, socketId: 'mock-socket-1' },
        2: { id: 2, name: 'Jugador 2', connected: true, socketId: 'mock-socket-2' }
      },
      board: emptyBoard
    }

    triggerClientEvent('server:game:started', {
      gameId: 'mock-game',
      machineMode: false,
      state: baseState
    })

    const boardStepOne = JSON.parse(JSON.stringify(emptyBoard))
    boardStepOne.cells[1][1] = { player: 1, atoms: 6 }

    const boardStepTwo = JSON.parse(JSON.stringify(emptyBoard))
    boardStepTwo.cells[1][1] = { player: 1, atoms: 1 }

    triggerClientEvent('server:game:stateUpdate', {
      state: {
        ...baseState,
        board: boardStepTwo
      },
      moveOrigin: { row: 1, col: 1 },
      animationSequence: [
        {
          row: 1,
          col: 1,
          delay: 0,
          board: boardStepOne,
          sourceCell: { row: 1, col: 1, atoms: 6, player: 1 }
        },
        {
          row: 1,
          col: 1,
          delay: 280,
          board: boardStepTwo,
          sourceCell: { row: 1, col: 1, atoms: 1, player: 1 }
        }
      ]
    })
  })

  const targetCell = page.locator('#game-board .game-cell[data-row="1"][data-col="1"]')
  await expect(page.locator('#game-board .game-cell')).toHaveCount(16)

  await expect.poll(async () => {
    return targetCell.locator('.atom-total').textContent()
  }).toBe('6')

  await expect(targetCell.locator('.atom-dot')).toHaveCount(3)

  await page.waitForTimeout(360)

  await expect(targetCell.locator('.atom-total')).toHaveCount(0)
  await expect(targetCell.locator('.atom-dot')).toHaveCount(1)
})
