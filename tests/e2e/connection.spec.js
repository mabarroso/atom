const { test, expect } = require('@playwright/test')

test('Connection-status controls are removed and game controls are available', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#connection-status')).toHaveCount(0)
  await expect(page.locator('#btn-status')).toHaveCount(0)
  await expect(page.locator('#btn-new-game')).toBeVisible()
  await expect(page.locator('#btn-join-game')).toBeVisible()
})

test('UI text is in Spanish and accessibility attributes exist', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Atom' })).toBeVisible()
  await expect(page.locator('#btn-new-game')).toHaveText('Nueva Partida')
  await expect(page.locator('#btn-join-game')).toHaveText('Unirse')
  await expect(page.locator('#btn-new-game')).toHaveAttribute('aria-label', 'Iniciar nueva partida')
  await expect(page.locator('#btn-join-game')).toHaveAttribute('aria-label', 'Unirse a partida')
})

test('Keyboard navigation and responsive viewports work', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')

  await page.keyboard.press('Tab')
  await expect(page.locator('#board-size')).toBeFocused()

  await page.setViewportSize({ width: 768, height: 1024 })
  await expect(page.locator('#game-container')).toBeVisible()

  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(page.locator('#game-container')).toBeVisible()
})
