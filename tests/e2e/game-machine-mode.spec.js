const { test, expect } = require('@playwright/test')

test.describe('Machine mode browser flow', () => {
  test('Player can start game in Machine mode', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const machineModeInput = document.getElementById('game-mode-machine')
      if (machineModeInput) {
        machineModeInput.checked = true
      }
    })
    await expect(page.locator('#game-mode-machine')).toBeChecked()
    await page.click('#btn-new-game')

    await expect(page.locator('#game-notice')).toContainText('Partida iniciada contra Máquina')
    await expect(page.locator('#player-2-indicator')).toContainText('Machine')
    await expect(page.locator('#game-board .game-cell')).toHaveCount(36)
  })

  test('Machine move is visible after player move', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const machineModeInput = document.getElementById('game-mode-machine')
      if (machineModeInput) {
        machineModeInput.checked = true
      }
    })
    await expect(page.locator('#game-mode-machine')).toBeChecked()
    await page.click('#btn-new-game')
    await expect(page.locator('#turn-number-indicator')).toContainText('Turno #1')

    await page.click('#game-board .game-cell[data-row="0"][data-col="0"]')
    await expect(page.locator('#game-board .game-cell[data-row="0"][data-col="0"]')).toHaveClass(/is-last-move/)
    await expect(page.locator('#turn-number-indicator')).toContainText('Turno #2')

    await expect.poll(async () => {
      return page.locator('#game-board .game-cell[data-row="0"][data-col="0"] .atom-dot').count()
    }, { timeout: 7000 }).toBeGreaterThanOrEqual(1)

    await expect(page.locator('#turn-indicator')).toContainText('Jugador 1')
    await expect(page.locator('#turn-number-indicator')).toContainText('Turno #3')
    await expect(page.locator('#game-board .game-cell.is-last-move')).toHaveCount(1)
    await expect(page.locator('#game-board .game-cell[data-row="0"][data-col="0"]')).not.toHaveClass(/is-last-move/)
  })

  test('Machine response includes approximately 2-second delay and no thinking message', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const machineModeInput = document.getElementById('game-mode-machine')
      if (machineModeInput) {
        machineModeInput.checked = true
      }
    })
    await expect(page.locator('#game-mode-machine')).toBeChecked()
    await page.click('#btn-new-game')

    await page.click('#game-board .game-cell[data-row="1"][data-col="1"]')

    await expect(page.locator('#turn-indicator')).toContainText('Machine')
    await page.waitForTimeout(1500)
    await expect(page.locator('#turn-indicator')).toContainText('Machine')
    await expect(page.locator('#turn-indicator')).toContainText('Jugador 1')

    await expect(page.locator('#game-notice')).not.toContainText(/Pensando|Thinking/i)
  })

  test('Machine label remains visible for Player 2', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const machineModeInput = document.getElementById('game-mode-machine')
      if (machineModeInput) {
        machineModeInput.checked = true
      }
    })
    await expect(page.locator('#game-mode-machine')).toBeChecked()
    await page.click('#btn-new-game')

    await expect(page.locator('#player-2-indicator')).toContainText('Machine')

    await page.click('#game-board .game-cell[data-row="2"][data-col="2"]')
    await expect.poll(async () => {
      return page.locator('#turn-indicator').textContent()
    }, { timeout: 7000 }).toContain('Jugador 1')

    await expect(page.locator('#player-2-indicator')).toContainText('Machine')
  })

  test('Complete flow reaches game end in Machine mode', async ({ page }) => {
    await page.goto('/')
    await page.selectOption('#board-size', '4')
    await page.evaluate(() => {
      const machineModeInput = document.getElementById('game-mode-machine')
      if (machineModeInput) {
        machineModeInput.checked = true
      }
    })
    await expect(page.locator('#game-mode-machine')).toBeChecked()
    await page.click('#btn-new-game')

    const turnIndicator = page.locator('#turn-indicator')
    const gameNotice = page.locator('#game-notice')
    let gameEnded = false

    for (let step = 0; step < 20; step += 1) {
      const currentNotice = (await gameNotice.textContent()) || ''
      if (currentNotice.includes('gana')) {
        gameEnded = true
        break
      }

      await expect(turnIndicator).toContainText('Jugador 1', { timeout: 9000 })
      await page.locator('#game-board .game-cell:not(.player-2)').first().click()

      const noticeAfterMove = (await gameNotice.textContent()) || ''
      if (noticeAfterMove.includes('gana')) {
        gameEnded = true
        break
      }

      await expect(turnIndicator).toContainText('Jugador 1', { timeout: 9000 })
    }

    if (!gameEnded) {
      const finalNotice = (await gameNotice.textContent()) || ''
      gameEnded = finalNotice.includes('gana')
    }

    expect(gameEnded).toBe(true)
  })
})
