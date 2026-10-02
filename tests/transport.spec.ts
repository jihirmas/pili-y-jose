import { expect, test } from '@playwright/test'

test('POST gets an authentic cross-origin postMessage from a nested Google-style sandbox', async ({
  page,
}) => {
  let writes = 0
  await page.route(
    'https://script.google.com/macros/s/test/exec',
    async (route) => {
      expect(route.request().method()).toBe('POST')
      const payload = JSON.parse(
        new URLSearchParams(route.request().postData()!).get('payload')!,
      )
      writes++
      // Emulates Google's wrapper; the browser still enforces cross-origin access.
      await route.fulfill({
        contentType: 'text/html',
        body: `<iframe sandbox="allow-scripts allow-same-origin" src="https://n-test-script.googleusercontent.com/ack?nonce=${payload.nonce}"></iframe>`,
      })
    },
  )
  await page.route(
    'https://n-test-script.googleusercontent.com/ack?*',
    async (route) => {
      const nonce = new URL(route.request().url()).searchParams.get('nonce')
      const ack = JSON.stringify({
        source: 'pili-jose-rsvp',
        nonce,
        success: true,
        code: 'RSVP_CREATED',
      })
      await route.fulfill({
        contentType: 'text/html',
        body: `<script>window.top.postMessage(${ack},'http://127.0.0.1:5173')</script>`,
      })
    },
  )
  await page.goto('/')
  const result = await page.evaluate(async () => {
    // Import the actual transport, not a test implementation.
    const modulePath = '/src/features/rsvp/submit.ts'
    const { submitRsvp } = await import(/* @vite-ignore */ modulePath)
    return await submitRsvp('https://script.google.com/macros/s/test/exec', {
      guestName: 'Prueba Local',
    })
  })
  expect(result).toMatchObject({ success: true, code: 'RSVP_CREATED' })
  expect(writes).toBe(1)
  await expect(page.locator('iframe')).toHaveCount(0)
  await expect(page.locator('form')).toHaveCount(0)
})
