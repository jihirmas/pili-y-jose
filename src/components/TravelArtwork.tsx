import { motion, useReducedMotion } from 'motion/react'
import { copy } from '../config/event'

export function Globe() {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="40" />
      <ellipse cx="50" cy="50" rx="18" ry="40" />
      <path d="M10 50h80M17 28h66M17 72h66M50 10v80" />
    </svg>
  )
}

export function Stamp({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      aria-hidden="true"
      className={`passport-stamp ${className}`}
      initial={reduced ? false : { opacity: 0, scale: 1.7, rotate: -28 }}
      animate={{ opacity: 1, scale: 1, rotate: -12 }}
      transition={
        reduced
          ? { duration: 0 }
          : { type: 'spring', stiffness: 190, damping: 15, delay: 0.85 }
      }
    >
      <span>{copy.hero.stamp}</span>
      <strong>{copy.hero.stampDate}</strong>
      <span>{copy.hero.title}</span>
    </motion.div>
  )
}

export function PhotoOutline() {
  return (
    <svg viewBox="0 0 160 120" fill="none" aria-hidden="true">
      <rect x="15" y="12" width="130" height="96" rx="2" />
      <circle cx="110" cy="38" r="10" />
      <path d="m15 89 37-37 37 37 20-20 36 35" />
    </svg>
  )
}

export function GiftOutline() {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path d="M23 54h74v47H23zM17 39h86v15H17zM60 39v62M60 39C24 40 26 8 43 17c9 5 17 22 17 22Zm0 0c36 1 34-31 17-22-9 5-17 22-17 22Z" />
    </svg>
  )
}
