export type SubmissionState =
  'idle' | 'validating' | 'submitting' | 'success' | 'error'
export const responseCodes = [
  'RSVP_CREATED',
  'INVALID_INVITE',
  'VALIDATION_ERROR',
  'CAPTCHA_FAILED',
  'DUPLICATE_RSVP',
  'DEADLINE_CLOSED',
  'SERVER_ERROR',
] as const
export type ResponseCode = (typeof responseCodes)[number]
export type FailureCode = Exclude<ResponseCode, 'RSVP_CREATED'> | 'TIMEOUT'
export type Ack = {
  source: 'pili-jose-rsvp'
  nonce: string
  success: boolean
  code: ResponseCode
}
