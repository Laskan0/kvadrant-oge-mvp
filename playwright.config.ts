import { defineConfig, devices } from '@playwright/test'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const remote = process.env.KVADRANT_BASE_URL
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  outputDir: join(tmpdir(), 'kvadrant-playwright-results'),
  use: {
    baseURL: remote || 'http://127.0.0.1:5173',
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: remote ? undefined : {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium-1440', use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 } } },
    { name: 'chromium-768', use: { browserName: 'chromium', viewport: { width: 768, height: 1024 } } },
    { name: 'chromium-360', use: { ...devices['Pixel 5'], viewport: { width: 360, height: 800 } } },
    { name: 'webkit-iphone-390', use: { ...devices['iPhone 13'], browserName: 'webkit', viewport: { width: 390, height: 844 } } },
    // 720 CSS px соответствуют 200% масштабу окна шириной 1440 физических px.
    { name: 'chromium-zoom-200', use: { browserName: 'chromium', viewport: { width: 720, height: 500 }, deviceScaleFactor: 2 } },
  ],
})
