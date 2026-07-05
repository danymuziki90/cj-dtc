import { test, expect, type APIRequestContext, type Page } from '@playwright/test'

type StudentCredentials = {
  email: string
  username: string
  password: string
}

const adminUsername = process.env.E2E_ADMIN_USERNAME || 'admincjtc'
const adminPassword = process.env.E2E_ADMIN_PASSWORD || 'admin@123'

async function loginAsAdmin(page: Page, request: APIRequestContext) {
  const loginResponse = await request.post('/api/admin/auth/login', {
    data: {
      username: adminUsername,
      password: adminPassword,
    },
  })

  expect(loginResponse.ok()).toBeTruthy()

  const setCookie = await loginResponse.headerValue('set-cookie')
  const tokenMatch = setCookie?.match(/admin_token=([^;]+)/)
  expect(tokenMatch?.[1]).toBeTruthy()

  await page.context().addCookies([
    {
      name: 'admin_token',
      value: tokenMatch![1],
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ])

  await page.goto('/admin/dashboard')
  await expect(page.getByText('Pilotage global de la plateforme')).toBeVisible({ timeout: 30_000 })
}

async function createFormationAndSession(
  request: APIRequestContext,
  options: {
    suffix: number
    price: number
  },
) {
  const formationResponse = await request.post('/api/formations', {
    data: {
      title: `E2E Formation ${options.suffix}`,
      description: 'Formation de test E2E',
      categorie: 'E2E',
      statut: 'brouillon',
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
      price: String(options.price),
      description: 'Session de test E2E',
    },
  })
  expect(sessionResponse.ok()).toBeTruthy()
  const session = await sessionResponse.json()

  return { formation, session }
}

async function createEnrollmentFixture(
  request: APIRequestContext,
  options: {
    suffix: number
    firstName: string
    lastName: string
    email: string
    paid: boolean
    price?: number
  },
) {
  const { formation, session } = await createFormationAndSession(request, {
    suffix: options.suffix,
    price: options.price ?? 100,
  })

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

async function createFreeRegistrationFixture(
  request: APIRequestContext,
  options: {
    suffix: number
    firstName: string
    lastName: string
    email: string
  },
) {
  const { session } = await createFormationAndSession(request, {
    suffix: options.suffix,
    price: 0,
  })

  const registrationResponse = await request.post('/api/programmes/register', {
    data: {
      sessionId: session.id,
      personal: {
        firstName: options.firstName,
        lastName: options.lastName,
        email: options.email,
        whatsapp: '+243990000111',
        address: 'Kinshasa',
      },
      answers: {
        expectations: 'Valider le flux automatique du compte etudiant.',
      },
      payment: {
        provider: 'pawapay',
        method: 'mobile_money',
        currency: 'USD',
      },
    },
  })

  expect(registrationResponse.ok()).toBeTruthy()
  return registrationResponse.json()
}

test.describe('Admin and student critical flows', () => {
  test.describe.configure({ mode: 'serial' })

  let createdStudent: StudentCredentials | null = null
  let autoProvisionedStudentEmail: string | null = null

  test('admin login works', async ({ page, request }) => {
    await loginAsAdmin(page, request)
    await expect(page.getByText('Pilotage global de la plateforme')).toBeVisible()
  })

  test('admin cannot create a student account before payment is fully validated', async ({ page, request }) => {
    await loginAsAdmin(page, request)

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
      { timeout: 90_000 },
    )
    await page.getByTestId('student-create-submit').click()
    const createResponse = await createResponsePromise
    expect(createResponse.status()).toBe(409)
    await expect(page.getByTestId('student-create-error')).toContainText(
      "Le compte etudiant ne peut etre cree qu'apres validation complete du paiement de la session souscrite.",
    )
    await expect(page.getByTestId('student-credentials-panel')).toHaveCount(0)
  })

  test('free session registration creates the student account automatically', async ({ page, request }) => {
    await loginAsAdmin(page, request)

    const suffix = Date.now()
    const email = `e2e.student.free.${suffix}@example.com`

    await createFreeRegistrationFixture(request, {
      suffix,
      firstName: 'E2E',
      lastName: `Free ${suffix}`,
      email,
    })

    await page.goto('/admin/students')
    await page.getByTestId('student-search-input').fill(email)
    await expect(page.getByText(email)).toBeVisible({ timeout: 30_000 })

    await page.goto('/admin/enrollments')
    await page.getByPlaceholder('Nom, email, formation ou lieu').fill(email)
    await expect(page.getByText('Compte actif')).toBeVisible({ timeout: 30_000 })
  })

  test('paid session validation creates the student account automatically', async ({ page, request }) => {
    await loginAsAdmin(page, request)

    const suffix = Date.now()
    const email = `e2e.student.auto.${suffix}@example.com`

    await createEnrollmentFixture(request, {
      suffix,
      firstName: 'E2E',
      lastName: `Auto ${suffix}`,
      email,
      paid: true,
    })

    autoProvisionedStudentEmail = email

    await page.goto('/admin/students')
    await page.getByTestId('student-search-input').fill(email)
    await expect(page.getByText(email)).toBeVisible({ timeout: 30_000 })

    await page.goto('/admin/enrollments')
    await page.getByPlaceholder('Nom, email, formation ou lieu').fill(email)
    await expect(page.getByText('Compte actif')).toBeVisible({ timeout: 30_000 })
  })

  test('student can log in after admin resets credentials on an auto-created account', async ({ page, request }) => {
    test.skip(!autoProvisionedStudentEmail, 'No auto-created student is available for the reset flow.')

    await loginAsAdmin(page, request)
    await page.goto('/admin/students')
    await page.getByTestId('student-search-input').fill(autoProvisionedStudentEmail!)
    await expect(page.getByText(autoProvisionedStudentEmail!)).toBeVisible({ timeout: 30_000 })

    page.once('dialog', async (dialog) => {
      await dialog.accept()
    })

    const resetResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/admin/system/students/') && response.request().method() === 'PUT',
      { timeout: 90_000 },
    )
    await page.getByRole('button', { name: 'Reinit. + e-mail' }).first().click()
    const resetResponse = await resetResponsePromise
    expect(resetResponse.ok()).toBeTruthy()

    await expect(page.getByTestId('student-credentials-panel')).toBeVisible({ timeout: 30_000 })
    await expect(page.getByTestId('student-credentials-copy')).toBeVisible()

    const username = (await page.getByTestId('student-credentials-username').textContent())?.trim()
    const password = (await page.getByTestId('student-credentials-password').textContent())?.trim()

    expect(username).toBeTruthy()
    expect(password).toBeTruthy()

    createdStudent = {
      email: autoProvisionedStudentEmail!,
      username: username as string,
      password: password as string,
    }

    await page.goto('/student/login')
    await page.getByTestId('student-login-username').fill(createdStudent.username)
    await page.getByTestId('student-login-password').fill(createdStudent.password)
    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/student/auth/login') && response.request().method() === 'POST',
    )
    await page.getByTestId('student-login-submit').click()
    const loginResponse = await loginResponsePromise
    expect(loginResponse.ok()).toBeTruthy()
    await expect(page.getByText(createdStudent.email)).toBeVisible({ timeout: 30_000 })
  })
})
