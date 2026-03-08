const { test, expect } = require('@playwright/test')
const AxeBuilder = require('@axe-core/playwright').default

test('Page meets WCAG 2.2 Level AA accessibility standards', async ({ page }) => {
  await page.goto('/')

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})

test('Interactive elements have accessible names', async ({ page }) => {
  await page.goto('/')

  const accessibilityScanResults = await new AxeBuilder({ page })
    .include('#btn-status')
    .include('#connection-status')
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})
