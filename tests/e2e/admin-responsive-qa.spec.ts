import { test, expect, devices, type Page } from '@playwright/test'

const adminUsername = process.env.E2E_ADMIN_USERNAME || 'admincjtc'
const adminPassword = process.env.E2E_ADMIN_PASSWORD || 'admin@123'

const pages = [
  { name: 'dashboard', path: '/admin/dashboard' },
  { name: 'students', path: '/admin/students' },
  { name: 'sessions', path: '/admin/sessions' },
  { name: 'payments', path: '/admin/payments' },
  { name: 'enrollments', path: '/admin/enrollments' },
  { name: 'documents', path: '/admin/documents' },
  { name: 'notifications', path: '/admin/notifications' },
  { name: 'articles', path: '/admin/articles' },
  { name: 'tarifs', path: '/admin/tarifs' },
] as const

async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
  await page.getByTestId('admin-login-username').fill(adminUsername)
  await page.getByTestId('admin-login-password').fill(adminPassword)
  await Promise.all([
    page.waitForURL(/\/admin\//, { timeout: 60000 }),
    page.getByTestId('admin-login-submit').click(),
  ])
}

async function assertNoHorizontalOverflow(page: Page, label: string) {
  const metrics = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    docScrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }))

  expect.soft(
    Math.max(metrics.bodyScrollWidth, metrics.docScrollWidth),
    `${label} has horizontal overflow: ${JSON.stringify(metrics)}`
  ).toBeLessThanOrEqual(metrics.innerWidth + 2)
}

async function assertActiveQuickLinkVisible(page: Page, label: string) {
  const quickNav = page.locator('nav[aria-label="Navigation rapide admin"]')
  if ((await quickNav.count()) === 0) return

  const activeLink = quickNav.locator('[aria-current="page"]').first()
  await expect(activeLink).toBeVisible()

  await page.waitForTimeout(150)

  const rect = await activeLink.evaluate((element) => {
    const bounds = element.getBoundingClientRect()
    return {
      left: bounds.left,
      right: bounds.right,
      viewportWidth: window.innerWidth,
    }
  })

  expect.soft(rect.left, `${label} active quick link is clipped on the left`).toBeGreaterThanOrEqual(0)
  expect.soft(rect.right, `${label} active quick link is clipped on the right`).toBeLessThanOrEqual(
    rect.viewportWidth
  )
}

test.describe('Admin responsive visual QA', () => {
  for (const variant of [
    { name: 'desktop', viewport: { width: 1440, height: 1100 } },
    { name: 'mobile', viewport: devices['iPhone 13'].viewport },
  ]) {
    test.describe(variant.name, () => {
      test.use({ viewport: variant.viewport })

      test(`critical admin pages render well on ${variant.name}`, async ({ page }, testInfo) => {
        test.setTimeout(420000)
        await loginAsAdmin(page)

        for (const target of pages) {
          await page.goto(target.path, { waitUntil: 'domcontentloaded' })
          await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
          await page.getByRole('heading').first().waitFor({ timeout: 15000 }).catch(() => {})
          await assertNoHorizontalOverflow(page, `${variant.name}:${target.name}`)
          await assertActiveQuickLinkVisible(page, `${variant.name}:${target.name}`)
          await page.screenshot({
            path: testInfo.outputPath(`${variant.name}-${target.name}.png`),
            fullPage: true,
          })
        }
      })
    })
  }
})
