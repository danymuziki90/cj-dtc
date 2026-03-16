import { test, expect, type APIRequestContext, type Page } from '@playwright/test'

type StudentCredentials = {
  email: string
  username: string
  password: string
}

const adminUsername = process.env.E2E_ADMIN_USERNAME || 'admincjtc'
const adminPassword = process.env.E2E_ADMIN_PASSWORD || 'admin@123'

async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login')
  await page.getByTestId('admin-login-username').fill(adminUsername)
  await page.getByTestId('admin-login-password').fill(adminPassword)
  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/admin/auth/login') && response.request().method() === 'POST'
  )
  await page.getByTestId('admin-login-submit').click()
  const loginResponse = await loginResponsePromise
  expect(loginResponse.ok()).toBeTruthy()
  await expect(page.getByText('Pilotage global de la plateforme')).toBeVisible({ timeout: 30_000 })
}

async function createEnrollmentFixture(
  request: APIRequestContext,
  options: {
    suffix: number
    firstName: string
    lastName: string
    email: string
    paid: boolean
  }
) {
  const formationResponse = await request.post('/api/formations', {
    data: {
      title: `E2E Formation ${options.suffix}`,
      description: 'Formation de test E2E',
      categorie: 'E2E',
      statut: 'publie',
    },
  })
  expect(formationResponse.ok()).toBeTruthy()
  const formation = await formationResponse.json()

  const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const endDate = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000)

  const sessionResponse = await request.post('/api/sessions', {
    data: {
      formationId: String(formation.id),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startTime: '09:00',
      endTime: '17:00',
      location: 'Kinshasa',
      format: 'presentiel',
      maxParticipants: '25',
      price: '100',
      description: 'Session de test E2E',
    },
  })
  expect(sessionResponse.ok()).toBeTruthy()
  const session = await sessionResponse.json()

  const enrollmentResponse = await request.post('/api/enrollments', {
    data: {
      firstName: options.firstName,
      lastName: options.lastName,
      email: options.email,
      formationId: String(formation.id),
      sessionId: String(session.id),
    },
  })
  expect(enrollmentResponse.ok()).toBeTruthy()
  const enrollment = await enrollmentResponse.json()

  if (options.paid) {
    const paymentResponse = await request.post('/api/payments', {
      data: {
        enrollmentId: enrollment.id,
        amount: Number(session.price || 100),
        method: 'mobile_money',
        status: 'success',
        reference: `E2E-PAID-${options.suffix}`,
      },
    })
    expect(paymentResponse.ok()).toBeTruthy()
  }

  return {
    enrollmentId: enrollment.id as number,
    email: options.email,
    fullName: `${options.firstName} ${options.lastName}`,
  }
}

test.describe('Admin and student critical flows', () => {
  test.describe.configure({ mode: 'serial' })

  let createdStudent: StudentCredentials | null = null

  test('admin login works', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.getByText('Pilotage global de la plateforme')).toBeVisible()
  })

  test('admin cannot create a student account before payment is fully validated', async ({ page, request }) => {
    await loginAsAdmin(page)

    const suffix = Date.now()
    const email = `e2e.student.unpaid.${suffix}@example.com`
    const fullName = `E2E Unpaid ${suffix}`

    await createEnrollmentFixture(request, {
      suffix,
      firstName: 'E2E',
      lastName: `Unpaid ${suffix}`,
      email,
      paid: false,
    })

    await page.goto('/admin/students')

    await page.getByTestId('student-create-name').fill(fullName)
    await page.getByTestId('student-create-email').fill(email)
    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/admin/system/students') && response.request().method() === 'POST',
      { timeout: 90_000 }
    )
    await page.getByTestId('student-create-submit').click()
    const createResponse = await createResponsePromise
    expect(createResponse.status()).toBe(409)
    await expect(page.getByTestId('student-create-error')).toContainText(
      "Le compte etudiant ne peut etre cree qu'apres validation complete du paiement de la session souscrite."
    )
    await expect(page.getByTestId('student-credentials-panel')).toHaveCount(0)
  })

  test('admin can create a student account after full payment validation', async ({ page, request }) => {
    await loginAsAdmin(page)

    const suffix = Date.now()
    const fullName = `E2E Student ${suffix}`
    const email = `e2e.student.paid.${suffix}@example.com`

    await createEnrollmentFixture(request, {
      suffix,
      firstName: 'E2E',
      lastName: `Student ${suffix}`,
      email,
      paid: true,
    })

    await page.goto('/admin/students')

    await page.getByTestId('student-create-name').fill(fullName)
    await page.getByTestId('student-create-email').fill(email)
    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/admin/system/students') && response.request().method() === 'POST',
      { timeout: 90_000 }
    )
    await page.getByTestId('student-create-submit').click()
    const createResponse = await createResponsePromise
    expect(createResponse.ok()).toBeTruthy()

    await expect(page.getByTestId('student-credentials-panel')).toBeVisible({ timeout: 30_000 })
    await expect(page.getByTestId('student-credentials-copy')).toBeVisible()

    const username = (await page.getByTestId('student-credentials-username').textContent())?.trim()
    const password = (await page.getByTestId('student-credentials-password').textContent())?.trim()

    expect(username).toBeTruthy()
    expect(password).toBeTruthy()

    createdStudent = {
      email,
      username: username as string,
      password: password as string,
    }

    await page.getByTestId('student-search-input').fill(email)
    await expect(page.getByText(email)).toBeVisible()
  })

  test('student can log in with generated credentials', async ({ page }) => {
    test.skip(!createdStudent, 'Student credentials were not generated by the creation flow.')

    await page.goto('/student/login')
    await page.getByTestId('student-login-username').fill(createdStudent!.username)
    await page.getByTestId('student-login-password').fill(createdStudent!.password)
    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/student/auth/login') && response.request().method() === 'POST'
    )
    await page.getByTestId('student-login-submit').click()
    const loginResponse = await loginResponsePromise
    expect(loginResponse.ok()).toBeTruthy()
    await expect(page.getByText(createdStudent!.email)).toBeVisible({ timeout: 30_000 })
  })
})

