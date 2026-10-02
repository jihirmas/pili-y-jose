import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { copy, dietOptions, event } from '../../config/event'
import { invitationFlags, type InvitationType } from '../../config/invitations'
import { isAppsScriptUrl, runtime } from '../../config/runtime'
import { useNow } from '../../hooks/useNow'
import { isRsvpClosed } from '../../lib/time'
import {
  cleanRsvp,
  createRsvpSchema,
  needsDietDetail,
  type RsvpValues,
} from './schema'
import { SubmitError, submitRsvp } from './submit'
import type { SubmissionState } from './types'
import { Recaptcha } from './Recaptcha'
import { Plane } from '../../components/TravelRoute'
import { Reveal } from '../../components/Reveal'

export function Rsvp({
  type,
  inviteToken,
}: {
  type: InvitationType
  inviteToken: string
}) {
  const { ceremony, couple } = invitationFlags(type)
  const [state, setState] = useState<SubmissionState>('idle')
  const [message, setMessage] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [captchaReset, setCaptchaReset] = useState(0)
  const [serverClosed, setServerClosed] = useState(false)
  const busy = useRef(false)
  const controller = useRef<AbortController | null>(null)
  const successHeading = useRef<HTMLHeadingElement>(null)
  const errorSummary = useRef<HTMLParagraphElement>(null)
  const closed = isRsvpClosed(useNow()) || serverClosed
  const configured =
    isAppsScriptUrl(runtime.appsScriptUrl) &&
    !!runtime.recaptchaSiteKey &&
    !!inviteToken
  const {
    register,
    control,
    unregister,
    handleSubmit,
    formState: { errors },
  } = useForm<RsvpValues>({
    resolver: zodResolver(createRsvpSchema(type)),
    shouldUnregister: true,
  })
  const accompanied =
    useWatch({ control, name: 'companionAttending' }) === 'yes'
  const guestDiet = useWatch({ control, name: 'guestDietType' })
  const companionDiet = useWatch({ control, name: 'companionDietType' })
  const disabled = state === 'validating' || state === 'submitting'
  useEffect(() => {
    if (!accompanied)
      unregister(['companionName', 'companionDietType', 'companionDietDetail'])
  }, [accompanied, unregister])
  useEffect(() => {
    if (!needsDietDetail(guestDiet)) unregister('guestDietDetail')
  }, [guestDiet, unregister])
  useEffect(() => {
    if (!needsDietDetail(companionDiet)) unregister('companionDietDetail')
  }, [companionDiet, unregister])
  useEffect(() => {
    if (state === 'success') successHeading.current?.focus()
  }, [state])
  useEffect(() => () => controller.current?.abort(), [])

  const field = (
    name: FieldPath<RsvpValues>,
    label: string,
    options: {
      type?: string
      required?: boolean
      autoComplete?: string
      maxLength?: number
    } = {},
  ) => (
    <div
      className={`field ${name === 'guestName' || name === 'song' || name === 'companionName' ? 'field-wide' : ''}`}
      key={name}
    >
      <label htmlFor={name}>
        {label}
        {options.required === false ? (
          <span className="optional-label">{copy.rsvp.optional}</span>
        ) : (
          ' *'
        )}
      </label>
      <input
        id={name}
        type={options.type || 'text'}
        inputMode={
          name === 'phone' ? 'tel' : name === 'email' ? 'email' : undefined
        }
        autoComplete={options.autoComplete || 'off'}
        maxLength={options.maxLength || 120}
        aria-required={options.required !== false}
        aria-invalid={!!errors[name]}
        aria-describedby={
          errors[name]
            ? `${name}-error`
            : name === 'phone'
              ? 'phone-hint'
              : undefined
        }
        {...register(name)}
      />
      {name === 'phone' && (
        <small id="phone-hint" className="field-hint">
          {copy.rsvp.phoneHint}
        </small>
      )}
      {errors[name] && (
        <span className="field-error" id={`${name}-error`}>
          {errors[name]?.message}
        </span>
      )}
    </div>
  )
  const diet = (companion = false) => {
    const name = companion ? 'companionDietType' : 'guestDietType'
    const detail = companion ? 'companionDietDetail' : 'guestDietDetail'
    return (
      <>
        <div className="field field-wide">
          <label htmlFor={name}>{copy.rsvp[name]} *</label>
          <select
            id={name}
            aria-required="true"
            aria-invalid={!!errors[name]}
            aria-describedby={errors[name] ? `${name}-error` : undefined}
            {...register(name)}
          >
            <option value="">{copy.rsvp.select}</option>
            {dietOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors[name] && (
            <span className="field-error" id={`${name}-error`}>
              {errors[name]?.message}
            </span>
          )}
        </div>
        {needsDietDetail(companion ? companionDiet : guestDiet) &&
          field(detail, copy.rsvp[detail], { maxLength: 500 })}
      </>
    )
  }
  async function send(values: RsvpValues) {
    if (isRsvpClosed() || serverClosed) {
      setServerClosed(true)
      busy.current = false
      setState('error')
      return
    }
    if (!configured || !captcha) {
      setMessage(configured ? copy.rsvp.captchaRequired : copy.rsvp.unavailable)
      setState('error')
      busy.current = false
      requestAnimationFrame(() => errorSummary.current?.focus())
      return
    }
    setState('submitting')
    setMessage('')
    controller.current = new AbortController()
    const cleaned = cleanRsvp(type, values)
    try {
      await submitRsvp(
        runtime.appsScriptUrl,
        { ...cleaned, inviteToken, recaptchaToken: captcha },
        controller.current.signal,
      )
      setState('success')
    } catch (error) {
      if (controller.current.signal.aborted) return
      const code = error instanceof SubmitError ? error.code : 'SERVER_ERROR'
      setMessage(copy.rsvp.errors[code])
      setState('error')
      if (code === 'DEADLINE_CLOSED') setServerClosed(true)
      requestAnimationFrame(() => errorSummary.current?.focus())
    } finally {
      busy.current = false
      setCaptcha('')
      setCaptchaReset((n) => n + 1)
    }
  }
  return (
    <section
      id="confirmar"
      className="rsvp section-wrap"
      aria-labelledby="rsvp-title"
    >
      <div className="rsvp-intro">
        <p className="eyebrow">{copy.rsvp.eyebrow}</p>
        <h2 id="rsvp-title">{copy.rsvp.title}</h2>
        <p>{copy.rsvp.intro}</p>
        <p className="rsvp-deadline">{copy.rsvp.deadline}</p>
      </div>
      <Reveal className="rsvp-ticket">
        {state !== 'success' && (
          <>
            <div className="ticket-header">
              <div>
                <p className="eyebrow">{copy.rsvp.ticketLabel}</p>
                <span className="signature">{event.couple.displayName}</span>
              </div>
              <Plane />
            </div>
            <div className="ticket-metadata">
              <div>
                <span>{copy.rsvp.ticketDestination}</span>
                <strong>{event.destinationLabel}</strong>
              </div>
              <div>
                <span>{copy.rsvp.ticketDate}</span>
                <strong>{event.dateShort}</strong>
              </div>
            </div>
          </>
        )}
        <div className="rsvp-content">
          {state === 'success' ? (
            <div className="boarding-pass" role="status">
              <p className="eyebrow">
                {copy.rsvp.success.eyebrow} <span aria-hidden="true">✓</span>
              </p>
              <h3 ref={successHeading} tabIndex={-1}>
                {copy.rsvp.success.title}
              </h3>
              <p>{copy.rsvp.success.body}</p>
            </div>
          ) : closed ? (
            <div className="rsvp-notice" role="status">
              <h3>{copy.rsvp.closed}</h3>
              <p>{copy.rsvp.closedDetail}</p>
            </div>
          ) : (
            <form
              noValidate
              aria-busy={disabled}
              onSubmit={(e) => {
                e.preventDefault()
                if (busy.current) return
                busy.current = true
                setState('validating')
                setMessage('')
                void handleSubmit(send, () => {
                  busy.current = false
                  setState('error')
                  setMessage(copy.rsvp.validation)
                })(e)
              }}
            >
              <p className="required-note">{copy.rsvp.required}</p>
              <fieldset disabled={disabled} className="form-fields">
                <legend className="sr-only">{copy.rsvp.title}</legend>
                <div className="form-grid">
                  {field('guestName', copy.rsvp.guestName, {
                    autoComplete: 'name',
                  })}
                  {field('email', copy.rsvp.email, {
                    type: 'email',
                    autoComplete: 'email',
                    maxLength: 254,
                  })}
                  {field('phone', copy.rsvp.phone, {
                    type: 'tel',
                    autoComplete: 'tel',
                    maxLength: 40,
                  })}
                  {ceremony && diet()}
                  {couple && (
                    <fieldset
                      className="companion-choice field-wide"
                      aria-describedby={
                        errors.companionAttending
                          ? 'companionAttending-error'
                          : undefined
                      }
                    >
                      <legend>{copy.rsvp.companionAttending} *</legend>
                      <div className="radio-options">
                        {(['yes', 'no'] as const).map((value) => (
                          <label key={value}>
                            <input
                              type="radio"
                              value={value}
                              aria-invalid={!!errors.companionAttending}
                              {...register('companionAttending')}
                            />
                            <span>{copy.rsvp[value]}</span>
                          </label>
                        ))}
                      </div>
                      {errors.companionAttending && (
                        <span
                          className="field-error"
                          id="companionAttending-error"
                        >
                          {errors.companionAttending.message}
                        </span>
                      )}
                    </fieldset>
                  )}
                  {couple && accompanied && (
                    <div className="companion-fields field-wide">
                      <p className="eyebrow">{copy.rsvp.companionTitle}</p>
                      {field('companionName', copy.rsvp.companionName)}
                      {ceremony && diet(true)}
                    </div>
                  )}
                  {field('song', copy.rsvp.song, {
                    required: false,
                    maxLength: 200,
                  })}
                </div>
              </fieldset>
              {configured ? (
                <Recaptcha
                  siteKey={runtime.recaptchaSiteKey}
                  onToken={setCaptcha}
                  resetCount={captchaReset}
                />
              ) : (
                <p className="config-notice">
                  {import.meta.env.DEV
                    ? copy.rsvp.preview
                    : copy.rsvp.unavailable}
                </p>
              )}
              <p
                ref={errorSummary}
                tabIndex={-1}
                className="submit-message"
                role={state === 'error' ? 'alert' : 'status'}
                aria-live="polite"
              >
                {message ||
                  (state === 'submitting'
                    ? copy.rsvp.submitting
                    : state === 'validating'
                      ? copy.rsvp.validating
                      : '')}
              </p>
              <button
                className="submit-button"
                type="submit"
                disabled={disabled || !configured}
              >
                {disabled
                  ? state === 'validating'
                    ? copy.rsvp.validating
                    : copy.rsvp.submitting
                  : copy.rsvp.submit}
                <span aria-hidden="true">↓</span>
              </button>
            </form>
          )}
        </div>
        {state !== 'success' && (
          <div className="ticket-stub" aria-hidden="true">
            <span>{event.couple.displayName}</span>
            <span>{event.dateShort}</span>
            <span>↓</span>
          </div>
        )}
      </Reveal>
    </section>
  )
}
