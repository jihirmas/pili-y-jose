import { MotionConfig } from 'motion/react'
import { copy, event } from './config/event'
import { resolveInvitation } from './config/invitations'
import { Hero } from './sections/Hero'
import { Itinerary } from './sections/Itinerary'
import { Locations } from './sections/Locations'
import { Contact, DressCode, Gallery, Gifts } from './sections/Optional'
import { Rsvp } from './features/rsvp/Rsvp'
import { Plane } from './components/TravelRoute'

export default function App() {
  const type = resolveInvitation(window.location.search)
  if (!type)
    return (
      <main className="invalid-invite">
        <Plane />
        <h1>{copy.invalid.title}</h1>
        <p>{copy.invalid.body}</p>
      </main>
    )
  const inviteToken = new URLSearchParams(window.location.search).get('i') || ''
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        {copy.nav.skip}
      </a>
      <header className="site-header">
        <nav aria-label="Principal">
          <a href="#nuestro-dia">{copy.nav.itinerary}</a>
          <a href="#ubicaciones">{copy.nav.locations}</a>
          <a href="#confirmar" className="nav-confirm">
            {copy.nav.rsvp}
            <span aria-hidden="true">↓</span>
          </a>
        </nav>
      </header>
      <main id="main">
        <Hero />
        <Itinerary type={type} />
        <Gifts />
        <Locations type={type} />
        <DressCode />
        <Rsvp type={type} inviteToken={inviteToken} />
        <Contact />
        <Gallery />
      </main>
      <footer className="footer">
        <span className="signature">{event.couple.displayName}</span>
        <p>{event.dateLabel}</p>
      </footer>
    </MotionConfig>
  )
}
