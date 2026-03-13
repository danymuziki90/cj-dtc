import { defineConfig, devices } from '@playwright/test'

const serverPort = process.env.PLAYWRIGHT_SERVER_PORT || '34568'
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${serverPort}`

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: {
    command: `cmd /c "set NODE_OPTIONS=--max-old-space-size=8192&& set NEXT_TEST_WASM=1&& scripts\\use-node22.cmd npx next dev --webpack --port ${serverPort}"`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
})
