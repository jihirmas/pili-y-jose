import { isAppsScriptUrl } from '../../config/runtime'
import { responseCodes, type Ack, type FailureCode } from './types'

export class SubmitError extends Error {
  code: FailureCode
  constructor(code: FailureCode) {
    super(code)
    this.code = code
  }
}

// HtmlService inserts a Google sandbox iframe inside the POST target. Only that
// target or its actual descendants may acknowledge; another Google frame cannot.
export function isExpectedFrame(
  source: MessageEventSource | null,
  root: Window | null,
  depth = 0,
): boolean {
  if (!root || !source || depth > 3) return false
  if (source === root) return true
  try {
    for (let i = 0; i < Math.min(root.length, 10); i++) {
      if (isExpectedFrame(source, root.frames[i], depth + 1)) return true
    }
  } catch {
    return false
  }
  return false
}

export function validAck(
  event: MessageEvent,
  frame: Window | null,
  nonce: string,
): event is MessageEvent<Ack> {
  if (
    !/^https:\/\/(?:[a-z0-9-]+[.-])?script\.googleusercontent\.com$/.test(
      event.origin,
    )
  )
    return false
  if (!isExpectedFrame(event.source, frame)) return false
  const data = event.data
  return (
    !!data &&
    typeof data === 'object' &&
    data.source === 'pili-jose-rsvp' &&
    data.nonce === nonce &&
    responseCodes.includes(data.code) &&
    typeof data.success === 'boolean' &&
    data.success === (data.code === 'RSVP_CREATED')
  )
}

export function submitRsvp(
  url: string,
  payload: object,
  signal?: AbortSignal,
  timeout = 15000,
): Promise<Ack> {
  if (!isAppsScriptUrl(url) || signal?.aborted)
    return Promise.reject(new SubmitError('SERVER_ERROR'))
  return new Promise((resolve, reject) => {
    const nonce = crypto.randomUUID()
    const frame = document.createElement('iframe')
    frame.name = `rsvp-${nonce}`
    frame.title = 'Confirmación de asistencia'
    frame.hidden = true
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = url
    form.target = frame.name
    form.hidden = true
    const field = document.createElement('input')
    field.type = 'hidden'
    field.name = 'payload'
    field.value = JSON.stringify({ ...payload, nonce })
    form.append(field)
    const cleanup = () => {
      clearTimeout(timer)
      window.removeEventListener('message', onMessage)
      signal?.removeEventListener('abort', onAbort)
      form.remove()
      frame.remove()
    }
    const onAbort = () => {
      cleanup()
      reject(new SubmitError('SERVER_ERROR'))
    }
    const onMessage = (event: MessageEvent) => {
      if (!validAck(event, frame.contentWindow, nonce)) return
      cleanup()
      if (event.data.success) resolve(event.data)
      else reject(new SubmitError(event.data.code as FailureCode))
    }
    const timer = window.setTimeout(() => {
      cleanup()
      reject(new SubmitError('TIMEOUT'))
    }, timeout)
    window.addEventListener('message', onMessage)
    signal?.addEventListener('abort', onAbort, { once: true })
    document.body.append(frame, form)
    try {
      HTMLFormElement.prototype.submit.call(form)
    } catch {
      onAbort()
    }
  })
}
