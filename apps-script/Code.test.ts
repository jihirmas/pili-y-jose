// Run the actual .gs source in an isolated V8 context with Google services mocked.
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { beforeEach, describe, expect, it, vi } from 'vitest'
type Output = { html: string; setXFrameOptionsMode: () => Output }
type Backend = {
  doPost: (e: { parameter: { payload: string } }) => Output
  setupSheet: () => void
  normalizePhone_: (phone: string) => string
  safeCell_: (input: string) => string
  validate_: (input: object, type: string) => Record<string, unknown>
  HEADERS: string[]
}
const source = readFileSync(`${process.cwd()}/apps-script/Code.gs`, 'utf8')
const nonce = '4d594dee-3c54-4e90-a4c6-9dc8e028a0af'
const props = {
  SPREADSHEET_ID: 'sheet',
  SHEET_NAME: 'RSVP',
  PARENT_ORIGIN: 'https://piliyjose.cl',
  RECAPTCHA_SECRET: 'server-only',
  TOKEN_CEREMONY_SINGLE: 'cs',
  TOKEN_CEREMONY_COUPLE: 'cc',
  TOKEN_PARTY_SINGLE: 'ps',
  TOKEN_PARTY_COUPLE: 'pc',
}
const base = {
  nonce,
  inviteToken: 'ps',
  recaptchaToken: 'captcha',
  guestName: 'Juan Pérez',
  email: ' JUAN@example.com ',
  phone: '+56 9 1234 5678',
}
function harness(
  options: {
    contacts?: string[][]
    captcha?: boolean
    host?: string
    lock?: boolean
    writeError?: boolean
    afterLock?: () => void
    wrongHeaders?: boolean
  } = {},
) {
  const written: unknown[][] = []
  const release = vi.fn()
  const flush = vi.fn()
  const sheet = {
    getLastRow: () => (options.contacts?.length || 0) + 1,
    getRange: vi.fn((row: number, col: number) => ({
      getValues: () =>
        row === 1
          ? [options.wrongHeaders ? ['wrong'] : api.HEADERS]
          : options.contacts || [],
      setNumberFormat: vi.fn(),
      setFontWeight: vi.fn(),
      setValues: (rows: unknown[][]) => {
        if (options.writeError) throw new Error('Write error')
        if (col === 1) written.push(...rows)
      },
    })),
    setFrozenRows: vi.fn(),
  }
  const fetch = vi.fn(() => ({
    getResponseCode: () => 200,
    getContentText: () =>
      JSON.stringify({
        success: options.captcha ?? true,
        hostname: options.host || 'piliyjose.cl',
      }),
  }))
  const context = vm.createContext({
    Date,
    console: { error: vi.fn() },
    PropertiesService: {
      getScriptProperties: () => ({ getProperties: () => props }),
    },
    Utilities: { getUuid: () => 'server-rsvp-id' },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => {
          options.afterLock?.()
          return options.lock ?? true
        },
        waitLock: vi.fn(),
        releaseLock: release,
      }),
    },
    UrlFetchApp: { fetch },
    SpreadsheetApp: {
      openById: () => ({
        getSheetByName: () => sheet,
        setSpreadsheetTimeZone: vi.fn(),
      }),
      flush,
    },
    HtmlService: {
      XFrameOptionsMode: { ALLOWALL: 'ALLOWALL' },
      createHtmlOutput: (html: string): Output => {
        const out = { html, setXFrameOptionsMode: () => out }
        return out
      },
    },
  })
  vm.runInContext(source, context)
  const api = context as unknown as Backend
  const post = (payload: object) =>
    api.doPost({ parameter: { payload: JSON.stringify(payload) } }).html
  return { api, post, written, release, flush, fetch, sheet }
}
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-01T12:00:00-03:00'))
})
describe('Apps Script validation and persistence', () => {
  it.each([
    ['ps', {}, 'party_single', 'PARTY', false, false, 1],
    [
      'pc',
      { companionAttending: false },
      'party_couple',
      'PARTY',
      true,
      false,
      1,
    ],
    [
      'pc',
      { companionAttending: true, companionName: 'María González' },
      'party_couple',
      'PARTY',
      true,
      true,
      2,
    ],
    [
      'cs',
      { guestDietType: 'none' },
      'ceremony_single',
      'CEREMONY',
      false,
      false,
      1,
    ],
    [
      'cc',
      { guestDietType: 'none', companionAttending: false },
      'ceremony_couple',
      'CEREMONY',
      true,
      false,
      1,
    ],
    [
      'cc',
      {
        guestDietType: 'none',
        companionAttending: true,
        companionName: 'María González',
        companionDietType: 'vegan',
      },
      'ceremony_couple',
      'CEREMONY',
      true,
      true,
      2,
    ],
  ])(
    'stores truthful invitation metadata for %s / %j',
    (token, fields, type, scope, invited, attending, count) => {
      const h = harness()
      const html = h.post({
        ...base,
        ...fields,
        inviteToken: token,
        invitationType: 'tampered_type',
        guestCount: 99,
      })
      expect(html).toContain('"code":"RSVP_CREATED"')
      expect(h.written).toHaveLength(1)
      expect(h.written[0].slice(2, 7)).toEqual([
        type,
        scope,
        invited,
        attending,
        count,
      ])
      expect(h.written[0][8]).toBe('juan@example.com')
      expect(h.flush).toHaveBeenCalledOnce()
      expect(h.release).toHaveBeenCalledOnce()
      expect(html).not.toContain('Juan')
      expect(html).not.toContain('server-rsvp-id')
      expect(html).toContain('window.top.postMessage')
      expect(html).toContain('"https://piliyjose.cl"')
    },
  )
  it('rejects forged invitation before captcha or storage', () => {
    const h = harness()
    expect(h.post({ ...base, inviteToken: 'forged' })).toContain(
      'INVALID_INVITE',
    )
    expect(h.written).toHaveLength(0)
    expect(h.fetch).not.toHaveBeenCalled()
  })
  it.each([
    { guestName: '' },
    { email: 'broken' },
    { phone: 'invalid' },
    { inviteToken: 'cs' },
    { inviteToken: 'cs', guestDietType: 'allergy' },
    { inviteToken: 'pc' },
    { inviteToken: 'pc', companionAttending: 'yes' },
    { inviteToken: 'pc', companionAttending: true },
    {
      inviteToken: 'cc',
      guestDietType: 'none',
      companionAttending: true,
      companionName: 'María González',
      companionDietType: 'other',
    },
  ])('rejects missing or conditional data %j', (fields) => {
    const h = harness()
    expect(h.post({ ...base, ...fields })).toContain('VALIDATION_ERROR')
    expect(h.written).toHaveLength(0)
  })
  it('cleans food and companion data outside invitation scope', () => {
    const h = harness()
    h.post({
      ...base,
      companionAttending: true,
      companionName: 'Fake Person',
      guestDietType: 'vegan',
      guestDietDetail: 'forged',
      companionDietType: 'vegan',
    })
    expect(h.written[0].slice(10, 15)).toEqual(['', '', '', '', ''])
    expect(h.written[0][6]).toBe(1)
  })
  it.each([{ captcha: false }, { host: 'evil.com' }])(
    'requires verified captcha and correct hostname: %j',
    (options) => {
      const h = harness(options)
      expect(h.post(base)).toContain('CAPTCHA_FAILED')
      expect(h.written).toHaveLength(0)
    },
  )
  it('checks duplicates using normalized email AND phone inside lock', () => {
    const h = harness({ contacts: [[' JUAN@EXAMPLE.COM ', '9 1234 5678']] })
    expect(h.post(base)).toContain('DUPLICATE_RSVP')
    expect(h.written).toHaveLength(0)
    expect(h.release).toHaveBeenCalledOnce()
    const different = harness({ contacts: [['juan@example.com', '998765432']] })
    expect(different.post(base)).toContain('RSVP_CREATED')
  })
  it('rejects after deadline before external services', () => {
    vi.setSystemTime(new Date('2026-12-10T00:00:00-03:00'))
    const h = harness()
    expect(h.post(base)).toContain('DEADLINE_CLOSED')
    expect(h.written).toHaveLength(0)
    expect(h.fetch).not.toHaveBeenCalled()
  })
  it('rechecks deadline after lock acquisition', () => {
    const h = harness({
      afterLock: () => vi.setSystemTime(new Date('2026-12-10T00:00:00-03:00')),
    })
    expect(h.post(base)).toContain('DEADLINE_CLOSED')
    expect(h.written).toHaveLength(0)
    expect(h.release).toHaveBeenCalledOnce()
  })
  it('does not write if lock is unavailable', () => {
    const h = harness({ lock: false })
    expect(h.post(base)).toContain('SERVER_ERROR')
    expect(h.written).toHaveLength(0)
    expect(h.release).not.toHaveBeenCalled()
  })
  it('releases lock after a write error without success or stack trace', () => {
    const h = harness({ writeError: true })
    const html = h.post(base)
    expect(html).toContain('SERVER_ERROR')
    expect(html).not.toContain('Write error')
    expect(h.release).toHaveBeenCalledOnce()
  })
  it('does not append to mismatched sheet headers', () => {
    const h = harness({ wrongHeaders: true })
    expect(h.post(base)).toContain('SERVER_ERROR')
    expect(h.written).toHaveLength(0)
  })
  it.each([
    '=IMPORTXML("x")',
    '+cmd',
    '-cmd',
    '@sum',
    '\t =SUM(1,2)',
    '\n+cmd',
  ])('sanitizes formula input %s', (input) => {
    expect(harness().api.safeCell_(input).startsWith("'")).toBe(true)
  })
  it('does not interpolate untrusted input in acknowledgement HTML', () => {
    const h = harness()
    expect(
      h.post({ ...base, nonce: '</script><script>alert(1)</script>' }),
    ).not.toContain('alert(1)')
    expect(h.written).toHaveLength(0)
  })
  it('sets up headers idempotently and freezes row without erasing data', () => {
    const h = harness()
    h.api.setupSheet()
    expect(h.written).toHaveLength(0)
    expect(h.sheet.setFrozenRows).toHaveBeenCalledWith(1)
  })
})
