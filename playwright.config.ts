import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    baseURL: 'http://127.0.0.1:5173',
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'npm run dev -- --port 5173',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'VITE_BASE_PATH=/piliyjose/ VITE_TOKEN_CEREMONY_SINGLE=test-cs VITE_TOKEN_CEREMONY_COUPLE=test-cc VITE_TOKEN_PARTY_SINGLE=test-ps VITE_TOKEN_PARTY_COUPLE=test-pc npx vite build --outDir test-results/production && VITE_BASE_PATH=/piliyjose/ npx vite preview --outDir test-results/production --host 127.0.0.1 --port 4173',
      url: 'http://127.0.0.1:4173/piliyjose/',
      reuseExistingServer: false,
    },
  ],
})
