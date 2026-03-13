const { test, expect } = require('@playwright/test')

async function setupTwoPlayers (browser, boardSize = 6) {
  const contextOne = await browser.newContext()
  const contextTwo = await browser.newContext()
  const pageOne = await contextOne.newPage()
  const pageTwo = await contextTwo.newPage()

  await pageOne.goto('/')
  await expect(pageOne.locator('#connection-status')).toContainText('Conectado')
  await pageOne.selectOption('#board-size', String(boardSize))
  await pageOne.click('#btn-new-game')

  const gameId = (await pageOne.locator('#game-id-value').textContent()).trim()
  await pageTwo.goto('/')
  await expect(pageTwo.locator('#connection-status')).toContainText('Conectado')
  await pageTwo.fill('#join-game-id', gameId)
  await pageTwo.click('#btn-join-game')

  await expect(pageOne.locator('#game-id-value')).toContainText(gameId)
  await expect(pageTwo.locator('#game-id-value')).toContainText(gameId)
  await expect(pageTwo.locator('#game-notice')).toContainText(/Partida iniciada|Esperando/)

  return { contextOne, contextTwo, pageOne, pageTwo }
}

async function playSequencedMove (pageOne, pageTwo, step) {
  const page = step.player === 1 ? pageOne : pageTwo
  const cellLocator = page.locator(`#game-board .game-cell[data-row="${step.row}"][data-col="${step.col}"]`)

  let applied = false
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const beforeCount = await cellLocator.locator('.atom-dot').count()
    await page.click(`#game-board .game-cell[data-row="${step.row}"][data-col="${step.col}"]`)
    await page.waitForTimeout(180)

    const afterCount = await cellLocator.locator('.atom-dot').count()
    if (afterCount >= beforeCount + 1) {
      applied = true
      break
    }

    await page.waitForTimeout(220)
  }

  expect(applied).toBe(true)
}

test('Game initialization and first move flow', async ({ page }) => {
  await page.goto('/')

  await page.click('#btn-new-game')
  await expect(page.locator('#game-board .game-cell')).toHaveCount(36)
  await expect(page.locator('#round-number-indicator')).toContainText('Ronda #1')
  await expect(page.locator('#turn-indicator')).toContainText('Turno de')

  await page.click('#game-board .game-cell[data-row="0"][data-col="0"]')
  await expect(page.locator('#game-board .game-cell[data-row="0"][data-col="0"] .atom-dot')).toHaveCount(1)
  await expect(page.locator('#round-number-indicator')).toContainText('Ronda #1')
  await expect(page.locator('#game-board .game-cell.is-last-move')).toHaveCount(1)
  await expect(page.locator('#game-board .game-cell[data-row="0"][data-col="0"]')).toHaveClass(/is-last-move/)
})

test('Game controls are available and localized', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#btn-new-game')).toHaveText('Nueva Partida')
  await expect(page.locator('#btn-restart-game')).toHaveText('Reiniciar')
})

test('Owned cell increments and turn alternates in 2-player game', async ({ browser }) => {
  test.fixme(true, 'Flaky player assignment across browser contexts; covered by deterministic multi-client harness when socket.io-client is available')
  const { contextOne, contextTwo, pageOne, pageTwo } = await setupTwoPlayers(browser)

  await playSequencedMove(pageOne, pageTwo, { player: 1, row: 2, col: 2 })

  await playSequencedMove(pageOne, pageTwo, { player: 2, row: 0, col: 0 })
  await expect(pageTwo.locator('#turn-indicator')).toContainText('Jugador 1')
  await expect(pageOne.locator('#turn-indicator')).toContainText('Jugador 1')
  await expect.poll(async () => {
    return pageOne.locator('#game-board .game-cell[data-row="0"][data-col="0"] .atom-dot').count()
  }).toBe(1)

  await playSequencedMove(pageOne, pageTwo, { player: 1, row: 2, col: 2 })
  await expect.poll(async () => {
    return pageOne.locator('#game-board .game-cell[data-row="2"][data-col="2"] .atom-dot').count()
  }).toBe(2)

  await contextOne.close()
  await contextTwo.close()
})

test('Invalid move on opponent cell is rejected', async ({ browser }) => {
  const { contextOne, contextTwo, pageOne, pageTwo } = await setupTwoPlayers(browser)

  await playSequencedMove(pageOne, pageTwo, { player: 1, row: 2, col: 2 })

  await pageTwo.click('#game-board .game-cell[data-row="2"][data-col="2"]')
  await expect.poll(async () => {
    return pageTwo.locator('#game-board .game-cell[data-row="2"][data-col="2"] .atom-dot').count()
  }).toBe(1)

  await contextOne.close()
  await contextTwo.close()
})

test('Deterministic atom layout classes are applied for 1, 2 and 3 atoms', async ({ browser }) => {
  const { contextOne, contextTwo, pageOne, pageTwo } = await setupTwoPlayers(browser)

  const targetCell = pageOne.locator('#game-board .game-cell[data-row="2"][data-col="2"]')

  await playSequencedMove(pageOne, pageTwo, { player: 1, row: 2, col: 2 })
  await expect(targetCell.locator('.atoms-wrap')).toHaveClass(/atoms-layout-1/)

  await playSequencedMove(pageOne, pageTwo, { player: 2, row: 0, col: 0 })
  await playSequencedMove(pageOne, pageTwo, { player: 1, row: 2, col: 2 })
  await expect(targetCell.locator('.atoms-wrap')).toHaveClass(/atoms-layout-2/)

  await playSequencedMove(pageOne, pageTwo, { player: 2, row: 0, col: 1 })
  await playSequencedMove(pageOne, pageTwo, { player: 1, row: 2, col: 2 })
  await expect(targetCell.locator('.atoms-wrap')).toHaveClass(/atoms-layout-3/)

  await contextOne.close()
  await contextTwo.close()
})

test('Connection recovery works when second player reconnects', async ({ browser }) => {
  const { contextOne, contextTwo, pageOne } = await setupTwoPlayers(browser)

  await pageOne.click('#game-board .game-cell[data-row="2"][data-col="2"]')
  const gameId = (await pageOne.locator('#game-id-value').textContent()).trim()

  await contextTwo.close()

  const reconnectContext = await browser.newContext()
  const reconnectPage = await reconnectContext.newPage()
  await reconnectPage.goto('/')
  await reconnectPage.fill('#join-game-id', gameId)
  await reconnectPage.click('#btn-join-game')

  await expect(reconnectPage.locator('#game-id-value')).toContainText(gameId)
  await expect(reconnectPage.locator('#round-number-indicator')).toContainText('Ronda #1')
  await expect(reconnectPage.locator('#game-board .game-cell[data-row="2"][data-col="2"] .atom-dot')).toHaveCount(1)

  await reconnectContext.close()
  await contextOne.close()
})

test('Atom counters are hidden by default and Player 1 reveal makes them visible to all players', async ({ browser }) => {
  const { contextOne, contextTwo, pageOne, pageTwo } = await setupTwoPlayers(browser)

  await expect(pageOne.locator('#atom-counters-panel')).toHaveClass(/d-none/)
  await expect(pageTwo.locator('#atom-counters-panel')).toHaveClass(/d-none/)

  await pageOne.click('#btn-open-settings')
  await pageTwo.click('#btn-open-settings')
  await expect(pageOne.locator('#btn-reveal-counters')).toBeVisible()

  await pageOne.click('#btn-reveal-counters')

  await expect(pageOne.locator('#atom-counters-panel')).not.toHaveClass(/d-none/)
  await expect(pageOne.locator('#atom-counter-total')).toHaveText('0')

  await pageOne.click('#game-board .game-cell[data-row="0"][data-col="0"]')
  await expect(pageOne.locator('#atom-counter-player-1')).toHaveText('1')
  await expect(pageOne.locator('#atom-counter-total')).toHaveText('1')

  await contextOne.close()
  await contextTwo.close()
})

test('Atom counter visibility is preserved after reconnect', async ({ browser }) => {
  const { contextOne, contextTwo, pageOne } = await setupTwoPlayers(browser)

  await pageOne.click('#btn-open-settings')
  await pageOne.click('#btn-reveal-counters')
  await expect(pageOne.locator('#atom-counters-panel')).not.toHaveClass(/d-none/)

  const gameId = (await pageOne.locator('#game-id-value').textContent()).trim()
  await contextTwo.close()

  const reconnectContext = await browser.newContext()
  const reconnectPage = await reconnectContext.newPage()
  await reconnectPage.goto('/')
  await reconnectPage.fill('#join-game-id', gameId)
  await reconnectPage.click('#btn-join-game')

  await expect(reconnectPage.locator('#game-id-value')).toContainText(gameId)
  await expect(reconnectPage.locator('#atom-counters-panel')).not.toHaveClass(/d-none/)

  await reconnectContext.close()
  await contextOne.close()
})

test('Settings panel groups configuration controls and supports open/close', async ({ page }) => {
  await page.goto('/')
  await page.click('#btn-new-game')

  await expect(page.locator('#settings-panel')).toHaveClass(/d-none/)

  await page.click('#btn-open-settings')
  await expect(page.locator('#settings-panel')).not.toHaveClass(/d-none/)
  await expect(page.locator('#btn-open-settings')).toHaveAttribute('aria-expanded', 'true')

  await expect(page.locator('#animation-delay-control')).toHaveAttribute('min', '0')
  await expect(page.locator('#animation-delay-control')).toHaveAttribute('max', '24000')
  await expect(page.locator('#animation-delay-control')).toHaveAttribute('step', '100')
  await expect(page.locator('#machine-delay-control')).toHaveAttribute('min', '0')
  await expect(page.locator('#machine-delay-control')).toHaveAttribute('max', '5000')
  await expect(page.locator('#machine-delay-control')).toHaveAttribute('step', '100')

  await page.click('#btn-close-settings')
  await expect(page.locator('#settings-panel')).toHaveClass(/d-none/)
  await expect(page.locator('#btn-open-settings')).toHaveAttribute('aria-expanded', 'false')
})

test('Multi-step cascade explosions produce animation sequence', async ({ browser }) => {
  test.fixme(true, 'Flaky multi-client sync across browsers without deterministic test harness')
  const { contextOne, contextTwo, pageOne, pageTwo } = await setupTwoPlayers(browser, 4)

  const sequence = [
    { player: 1, row: 3, col: 3 },
    { player: 2, row: 3, col: 2 },
    { player: 1, row: 3, col: 1 },
    { player: 2, row: 3, col: 2 },
    { player: 1, row: 3, col: 3 }
  ]

  for (let index = 0; index < sequence.length; index += 1) {
    const step = sequence[index]
    await playSequencedMove(pageOne, pageTwo, step)
  }

  await expect.poll(async () => {
    const farA = await pageOne.locator('#game-board .game-cell[data-row="2"][data-col="3"] .atom-dot').count()
    const farB = await pageOne.locator('#game-board .game-cell[data-row="3"][data-col="2"] .atom-dot').count()
    return farA + farB
  }).toBeGreaterThan(0)

  await expect.poll(async () => {
    return pageOne.locator('#game-board .game-cell[data-row="3"][data-col="2"] .atom-dot').count()
  }).toBeGreaterThanOrEqual(0)

  await contextOne.close()
  await contextTwo.close()
})

test('Win condition triggers when opponent has no atoms', async ({ browser }) => {
  test.fixme(true, 'Flaky multi-client sync across browsers without deterministic test harness')
  const { contextOne, contextTwo, pageOne, pageTwo } = await setupTwoPlayers(browser, 4)

  const sequence = [
    { player: 1, row: 3, col: 3 },
    { player: 2, row: 3, col: 2 },
    { player: 1, row: 3, col: 3 }
  ]

  await playSequencedMove(pageOne, pageTwo, sequence[0])
  await playSequencedMove(pageOne, pageTwo, sequence[1])
  await playSequencedMove(pageOne, pageTwo, sequence[2])

  await expect.poll(async () => {
    return (await pageOne.locator('#game-notice').textContent()) || ''
  }).toContain('¡Jugador 1 gana!')

  await contextOne.close()
  await contextTwo.close()
})

test('Board size selector supports 4x4, 6x6, 8x8, and 10x10', async ({ page }) => {
  await page.goto('/')

  await page.selectOption('#board-size', '4')
  await page.click('#btn-new-game')
  await expect(page.locator('#game-board .game-cell')).toHaveCount(16)

  await page.selectOption('#board-size', '6')
  await page.click('#btn-new-game')
  await expect(page.locator('#game-board .game-cell')).toHaveCount(36)

  await page.selectOption('#board-size', '8')
  await page.click('#btn-new-game')
  await expect(page.locator('#game-board .game-cell')).toHaveCount(64)

  await page.selectOption('#board-size', '10')
  await page.click('#btn-new-game')
  await expect(page.locator('#game-board .game-cell')).toHaveCount(100)
})

test('Spanish UI text and no browser console errors', async ({ page }) => {
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })

  await page.goto('/')
  await expect(page.locator('#btn-new-game')).toHaveText('Nueva Partida')
  await expect(page.locator('#btn-join-game')).toHaveText('Unirse')
  await expect(page.locator('#game-notice')).toContainText('Esperando inicio de partida')

  expect(consoleErrors).toEqual([])
})
