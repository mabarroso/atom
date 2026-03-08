const { test, expect } = require('@playwright/test')

test('Client connects to server and displays connection status', async ({ page }) => {
  await page.goto('/')

  const status = page.locator('#connection-status')
  await expect(status).toHaveText(/Conectado|Conectando.../)
})

test('UI text is in Spanish and accessibility attributes exist', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Atom' })).toBeVisible()
  await expect(page.locator('#btn-status')).toHaveText('Solicitar estado')
  await expect(page.locator('#connection-status')).toHaveAttribute('aria-live', 'polite')
  await expect(page.locator('#connection-status')).toHaveAttribute('aria-label', 'Estado de conexión')
  await expect(page.locator('#btn-status')).toHaveAttribute('aria-label', 'Solicitar estado')
})

test('Keyboard navigation and responsive viewports work', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')

  await page.keyboard.press('Tab')
  await expect(page.locator('#btn-status')).toBeFocused()

  await page.setViewportSize({ width: 768, height: 1024 })
  await expect(page.locator('#connection-status')).toBeVisible()

  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(page.locator('#connection-status')).toBeVisible()
})
