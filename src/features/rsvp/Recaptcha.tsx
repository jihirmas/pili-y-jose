import { useEffect, useRef, useState } from 'react'
import { copy } from '../../config/event'

type RecaptchaApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string
      size: 'compact'
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
    },
  ) => number
  reset: (id: number) => void
}
declare global {
  interface Window {
    grecaptcha?: RecaptchaApi
    onPiliJoseCaptcha?: () => void
  }
}
let loading: Promise<RecaptchaApi> | undefined
function loadRecaptcha() {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha)
  if (loading) return loading
  loading = new Promise<RecaptchaApi>((resolve, reject) => {
    const script = document.createElement('script')
    const fail = () => {
      clearTimeout(timer)
      script.remove()
      loading = undefined
      reject(new Error('captcha'))
    }
    const timer = window.setTimeout(fail, 15000)
    window.onPiliJoseCaptcha = () => {
      clearTimeout(timer)
      if (window.grecaptcha) resolve(window.grecaptcha)
      else fail()
    }
    script.src =
      'https://www.google.com/recaptcha/api.js?onload=onPiliJoseCaptcha&render=explicit&hl=es'
    script.async = true
    script.defer = true
    script.onerror = fail
    document.head.append(script)
  })
  return loading
}
export function Recaptcha({
  siteKey,
  onToken,
  resetCount,
}: {
  siteKey: string
  onToken: (token: string) => void
  resetCount: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const widget = useRef<number | undefined>(undefined)
  const callback = useRef(onToken)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    callback.current = onToken
  }, [onToken])
  useEffect(() => {
    let active = true
    loadRecaptcha()
      .then((api) => {
        if (!active || !ref.current) return
        widget.current = api.render(ref.current, {
          sitekey: siteKey,
          size: 'compact',
          callback: (token) => callback.current(token),
          'expired-callback': () => callback.current(''),
          'error-callback': () => {
            callback.current('')
            setState('error')
          },
        })
        setState('ready')
      })
      .catch(() => {
        if (active) setState('error')
      })
    const container = ref.current
    return () => {
      active = false
      if (widget.current !== undefined) window.grecaptcha?.reset(widget.current)
      widget.current = undefined
      container?.replaceChildren()
    }
  }, [siteKey, retry])
  useEffect(() => {
    if (widget.current !== undefined) window.grecaptcha?.reset(widget.current)
  }, [resetCount])
  return (
    <div className="captcha">
      <p className="field-label">{copy.rsvp.captchaLabel} *</p>
      <div ref={ref} />
      {state === 'loading' && <p role="status">{copy.rsvp.captchaLoading}</p>}
      {state === 'error' && (
        <div role="alert">
          <p>{copy.rsvp.errors.CAPTCHA_FAILED}</p>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setState('loading')
              setRetry((n) => n + 1)
            }}
          >
            {copy.rsvp.captchaRetry}
          </button>
        </div>
      )}
    </div>
  )
}
