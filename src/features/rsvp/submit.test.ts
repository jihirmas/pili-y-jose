import { describe, expect, it, vi } from 'vitest'
import { submitRsvp, validAck } from './submit'
const origin = 'https://n-abc-script.googleusercontent.com'
const goodOrigin = 'https://abc.script.googleusercontent.com'
const ack = {
  source: 'pili-jose-rsvp',
  nonce: 'one',
  code: 'RSVP_CREATED',
  success: true,
}
describe('real acknowledgement', () => {
  it('requires expected source, Google origin, marker, active nonce and matching success', () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const check = (
      data = ack,
      source = frame.contentWindow,
      messageOrigin = goodOrigin,
    ) =>
      validAck(
        new MessageEvent('message', { data, source, origin: messageOrigin }),
        frame.contentWindow,
        'one',
      )
    expect(check()).toBe(true)
    expect(check(ack, window)).toBe(false)
    expect(check(ack, frame.contentWindow, origin)).toBe(true)
    expect(
      check(
        ack,
        frame.contentWindow,
        'https://script.googleusercontent.com.evil.com',
      ),
    ).toBe(false)
    expect(check(ack, frame.contentWindow, 'https://evil.com')).toBe(false)
    expect(check({ ...ack, nonce: 'old' })).toBe(false)
    expect(check({ ...ack, source: 'other' })).toBe(false)
    expect(check({ ...ack, success: false })).toBe(false)
    expect(check({ ...ack, code: 'UNKNOWN' })).toBe(false)
    frame.remove()
  })
  it('accepts the actual nested HtmlService sandbox, not another iframe', () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const nested = frame.contentDocument!.createElement('iframe')
    frame.contentDocument!.body.append(nested)
    expect(
      validAck(
        new MessageEvent('message', {
          data: ack,
          source: nested.contentWindow,
          origin: goodOrigin,
        }),
        frame.contentWindow,
        'one',
      ),
    ).toBe(true)
    frame.remove()
  })
  it('times out and cleans up without declaring success', async () => {
    vi.useFakeTimers()
    vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {})
    const request = submitRsvp(
      'https://script.google.com/macros/s/test/exec',
      {},
      undefined,
      100,
    )
    const assertion = expect(request).rejects.toMatchObject({ code: 'TIMEOUT' })
    await vi.advanceTimersByTimeAsync(100)
    await assertion
    expect(document.querySelector('iframe')).toBeNull()
    expect(document.querySelector('form')).toBeNull()
  })
})
