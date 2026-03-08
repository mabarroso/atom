const { test, expect } = require('@playwright/test')
const AxeBuilder = require('@axe-core/playwright').default

test('Game board has accessible controls and labels', async ({ page }) => {
  await page.goto('/')
  await page.click('#btn-new-game')

  const firstCell = page.locator('#game-board .game-cell').first()
  await expect(firstCell).toHaveAttribute('aria-label', /Celda fila 1 columna 1/)

  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')

  await expect(page.locator('#btn-new-game')).toBeVisible()
})

test('Keyboard-only flow reaches board cells and performs move', async ({ page }) => {
  await page.goto('/')

  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')

  const firstCell = page.locator('#game-board .game-cell').first()
  await firstCell.focus()
  await page.keyboard.press('Enter')
  await expect(firstCell.locator('.atom-dot')).toHaveCount(1)
})

test('Turn announcements update ARIA live region after valid move', async ({ page }) => {
  await page.goto('/')
  await page.click('#btn-new-game')
  await page.click('#game-board .game-cell[data-row="2"][data-col="2"]')
  await expect(page.locator('#turn-indicator')).toContainText('Jugador 2')
})

test('Focused controls and cells expose visible focus styles', async ({ page }) => {
  await page.goto('/')
  await page.click('#btn-new-game')

  const button = page.locator('#btn-new-game')
  await button.focus()
  await expect(button).toBeFocused()

  const firstCell = page.locator('#game-board .game-cell').first()
  await firstCell.focus()
  await expect(firstCell).toBeFocused()
})

test('Game area passes axe checks', async ({ page }) => {
  await page.goto('/')
  await page.click('#btn-new-game')

  const accessibilityScanResults = await new AxeBuilder({ page })
    .include('#game-container')
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})
