import { expect, test } from '@playwright/test'
const variants = [
  'ceremony_single',
  'ceremony_couple',
  'party_single',
  'party_couple',
]
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-01T12:00:00-03:00'))
})
for (const width of [320, 390, 768, 1440]) {
  test(`all invitation variants fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const type of variants) {
      await page.goto(`/?preview=${type}`)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true)
      if (type.startsWith('party'))
        await expect(page.locator('body')).not.toContainText(
          /Iglesia|Ceremonia|Cóctel|17:30|19:00|Restricción alimentaria/i,
        )
      else
        await expect(
          page.getByLabel('Restricción alimentaria *', { exact: true }),
        ).toBeVisible()
      if (type.endsWith('couple')) {
        await page.getByLabel('Sí', { exact: true }).check()
        await page
          .getByLabel('Nombre y apellido del acompañante *')
          .fill('María González')
        await page.getByLabel('No', { exact: true }).check()
        await expect(
          page.getByLabel('Nombre y apellido del acompañante *'),
        ).toHaveCount(0)
        await page.getByLabel('Sí', { exact: true }).check()
        await expect(
          page.getByLabel('Nombre y apellido del acompañante *'),
        ).toHaveValue('')
      }
    }
  })
}
test('captures desktop and mobile and checks keyboard navigation', async ({
  page,
}) => {
  await page.goto('/?preview=ceremony_couple')
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('link', { name: 'Ir al contenido' }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur())
  await page.evaluate(() => document.fonts.ready)
  for (const img of await page.locator('img[loading="lazy"]').all()) {
    await img.scrollIntoViewIfNeeded()
    await img.evaluate((element: HTMLImageElement) => element.decode())
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  await page.evaluate(() => document.fonts.ready)
  for (const img of await page.locator('img[loading="lazy"]').all()) {
    await img.scrollIntoViewIfNeeded()
    await img.evaluate((element: HTMLImageElement) => element.decode())
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true })
})
test('production under a Pages subpath loads assets and all four token variants, and rejects preview', async ({
  page,
}) => {
  await page.goto('http://127.0.0.1:4173/piliyjose/?preview=ceremony_couple')
  await expect(page.getByRole('heading')).toHaveText(
    'Esta invitación necesita un enlace válido.',
  )
  for (const token of ['test-cs', 'test-cc', 'test-ps', 'test-pc']) {
    await page.goto(`http://127.0.0.1:4173/piliyjose/?i=${token}`)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Pili')
    for (const img of await page.locator('img[loading="lazy"]').all()) {
      await expect(img).toHaveAttribute('src', /^\/piliyjose\/images\//)
      await img.scrollIntoViewIfNeeded()
      await img.evaluate((element: HTMLImageElement) => element.decode())
    }
    const favicon = await page.locator('link[rel="icon"]').getAttribute('href')
    expect(favicon).toBe('/piliyjose/favicon.svg')
    expect(
      (await page.request.get(`http://127.0.0.1:4173${favicon}`)).ok(),
    ).toBe(true)
    await page
      .getByRole('link', { name: 'Confirmar', exact: false })
      .first()
      .click()
    await expect(page).toHaveURL(
      new RegExp(`/piliyjose/\\?i=${token}#confirmar$`),
    )
    await expect(page.locator('body')).not.toContainText(
      /TODO|PLACEHOLDER|imagen pendiente|Vista previa de desarrollo/,
    )
    if (token.startsWith('test-p'))
      await expect(page.locator('body')).not.toContainText(
        /Iglesia|Ceremonia|Cóctel|17:30|19:00|Restricción alimentaria/i,
      )
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex,nofollow,noarchive',
    )
  }
})
test('invalid invitation reveals no event details', async ({ page }) => {
  await page.goto('/?i=invalid')
  await expect(page.getByRole('heading')).toHaveText(
    'Esta invitación necesita un enlace válido.',
  )
  await expect(page.locator('body')).not.toContainText(
    /2027|Alto San Francisco|Iglesia|22:00/,
  )
})

test('captcha uses a centered horizontal layout when it fits and adapts on resize', async ({
  page,
}) => {
  // Stub Google's fixed-size widget; never send an RSVP or solve a real captcha.
  await page.addInitScript(() => {
    window.grecaptcha = {
      render: (element, options) => {
        element.dataset.size = options.size
        const widget = document.createElement('div')
        widget.style.width = options.size === 'normal' ? '304px' : '164px'
        widget.style.height = options.size === 'normal' ? '78px' : '144px'
        widget.style.flexShrink = '0'
        widget.textContent = 'Verificación de prueba'
        element.append(widget)
        return 0
      },
      reset: () => {},
    }
  })
  await page.goto('http://127.0.0.1:4173/piliyjose/?i=test-ps')
  const container = page.locator('.captcha-widget')
  for (const width of [1440, 390, 375, 320, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(container).toHaveAttribute(
      'data-size',
      width === 320 ? 'compact' : 'normal',
    )
    await container.scrollIntoViewIfNeeded()
    const outer = await container.boundingBox()
    const inner = await container.locator('div').boundingBox()
    expect(outer).not.toBeNull()
    expect(inner).not.toBeNull()
    expect(inner!.x).toBeGreaterThanOrEqual(outer!.x)
    expect(inner!.x + inner!.width).toBeLessThanOrEqual(outer!.x + outer!.width)
    expect(
      Math.abs(inner!.x + inner!.width / 2 - outer!.x - outer!.width / 2),
    ).toBeLessThan(1)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
})

test('motion reveals content on scroll and respects reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/?preview=ceremony_couple')
  await expect(page.locator('.passport-stamp')).toHaveCSS('opacity', '1')
  const row = page.locator('.schedule-row').first()
  await expect(row).toHaveCSS('opacity', '0')
  await row.scrollIntoViewIfNeeded()
  await expect(row).toHaveCSS('opacity', '1')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await expect(page.locator('.schedule-row').first()).toHaveCSS('opacity', '1')
  await expect(page.locator('.passport-stamp')).toHaveCSS('opacity', '1')
})
