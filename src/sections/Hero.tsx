import { copy, event } from '../config/event'
import { countdown } from '../lib/time'
import { useNow } from '../hooks/useNow'
import { TravelRoute } from '../components/TravelRoute'
import { Globe, Stamp } from '../components/TravelArtwork'
import { motion, useReducedMotion } from 'motion/react'

function Countdown() {
  const values = countdown(event.ceremonyStart, useNow())
  return (
    <div className="countdown">
      <p className="eyebrow">{copy.hero.countdown}</p>
      <div
        className="countdown-values"
        role="timer"
        aria-label={copy.hero.countdown}
      >
        {values.map((value, i) => (
          <div key={copy.hero.units[i]}>
            <span className="countdown-number">
              {String(value).padStart(2, '0')}
            </span>
            <span className="countdown-unit">{copy.hero.units[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
export function Hero() {
  const reduced = useReducedMotion()
  return (
    <section className="hero" aria-labelledby="couple-title">
      <div className="passport-cover">
        <div className="passport-top">
          <span>{copy.hero.passport}</span>
          <Globe />
          <span className="passport-destination">
            {copy.hero.destination}
            <strong>{event.destinationLabel}</strong>
          </span>
        </div>
        <div className="passport-body">
          <div className="hero-center">
            <p className="eyebrow hero-announcement">{copy.hero.title}</p>
            <motion.h1
              id="couple-title"
              initial={reduced ? false : { opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduced ? 0 : 1,
                delay: reduced ? 0 : 0.2,
              }}
            >
              {event.couple.person1}
              <span>&amp;</span>
              {event.couple.person2}
            </motion.h1>
            <div className="hero-schedule">
              <div className="hero-date">
                <p>{event.dateLabel}</p>
              </div>
              <Countdown />
            </div>
            <a href="#nuestro-dia" className="scroll-cue">
              {copy.hero.scroll}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <div className="passport-decoration" aria-hidden="true">
          <Stamp />
          <TravelRoute />
        </div>
      </div>
    </section>
  )
}
