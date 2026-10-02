import { event } from '../config/event'
export const isRsvpClosed = (now = Date.now()) =>
  now >= Date.parse(event.rsvpDeadline)
export function countdown(target: string, now = Date.now()) {
  const total = Math.max(0, Math.floor((Date.parse(target) - now) / 1000))
  return [
    Math.floor(total / 86400),
    Math.floor(total / 3600) % 24,
    Math.floor(total / 60) % 60,
    total % 60,
  ]
}
