const { test, expect } = require('@playwright/test')

test('Game layout works on mobile tablet desktop', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')
  await expect(page.locator('#btn-new-game')).toBeVisible()
  await page.click('#btn-new-game')
  await expect(page.locator('#game-board')).toBeVisible()

  await page.setViewportSize({ width: 768, height: 1024 })
  await expect(page.locator('#game-board')).toBeVisible()

  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(page.locator('#game-board')).toBeVisible()
})

test('Mobile cells meet 44x44 touch target minimum', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')
  await page.click('#btn-new-game')

  const box = await page.locator('#game-board .game-cell').first().boundingBox()
  expect(box).toBeTruthy()
  expect(box.width).toBeGreaterThanOrEqual(44)
  expect(box.height).toBeGreaterThanOrEqual(44)
})

test('Reduced motion preference disables animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.click('#btn-new-game')

  const animationName = await page.locator('#game-board .game-cell').first().evaluate((element) => {
    return window.getComputedStyle(element).animationName
  })

  expect(animationName === 'none' || animationName === '').toBeTruthy()
})
