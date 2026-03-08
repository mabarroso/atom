const { test, expect, devices } = require('@playwright/test')

test.use({
  viewport: devices['Pixel 5'].viewport,
  userAgent: devices['Pixel 5'].userAgent,
  deviceScaleFactor: devices['Pixel 5'].deviceScaleFactor,
  hasTouch: true
})

test('Game is usable on mobile emulator (Pixel 5)', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#connection-status')).toContainText('Conectado')

  await page.click('#btn-new-game')
  await expect(page.locator('#game-board')).toBeVisible()
  await expect(page.locator('#game-board .game-cell')).toHaveCount(36)

  const firstCell = page.locator('#game-board .game-cell').first()
  await firstCell.click()
  await expect(firstCell.locator('.atom-dot')).toHaveCount(1)
})
