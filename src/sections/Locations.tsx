import { useRef, useState, type CSSProperties } from 'react'
import { copy, event } from '../config/event'
import { invitationFlags, type InvitationType } from '../config/invitations'
import { Reveal } from '../components/Reveal'

function NavigationLinks({
  maps,
  waze,
  name,
}: {
  maps: string
  waze?: string
  name: string
}) {
  return (
    <div className="navigation-links">
      <a
        href={maps}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${copy.locations.maps}: ${name}`}
      >
        {copy.locations.maps}
        <span aria-hidden="true">↓</span>
      </a>
      {waze && (
        <a
          href={waze}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${copy.locations.waze}: ${name}`}
        >
          {copy.locations.waze}
          <span aria-hidden="true">↓</span>
        </a>
      )}
    </div>
  )
}
function EventMap({ ceremony }: { ceremony: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [zoom, setZoom] = useState(false)
  const map = event.mapImage
  // A map showing the church is never reused for party-only invitations.
  const src = ceremony ? map?.src : map?.partySrc
  const alt = ceremony ? map?.alt : map?.partyAlt
  if (!map || !src || !alt)
    return (
      <Reveal className="map-placeholder">
        <div className="map-placeholder-art" aria-hidden="true">
          <svg
            viewBox="0 0 900 350"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            <path d="M-40 80C200 250 290-60 520 120s340 50 430 190M-40 120C200 290 290-20 520 160s340 50 430 190M-40 160C200 330 290 20 520 200s340 50 430 190M-40 200C200 370 290 60 520 240s340 50 430 190M150-30 310 400M210-30 370 400M650-30 520 400M710-30 580 400" />
          </svg>
          <span className="map-pin">
            <svg viewBox="0 0 48 60">
              <path d="M24 56S4 35 4 24a20 20 0 1 1 40 0c0 11-20 32-20 32Z" />
              <circle cx="24" cy="24" r="7" />
            </svg>
          </span>
        </div>
        <div className="map-placeholder-caption">
          <h3>{copy.locations.mapPending}</h3>
          <p>{copy.locations.mapPendingDetail}</p>
        </div>
      </Reveal>
    )
  return (
    <div
      className="event-map"
      style={
        { '--map-focus': map.mobilePosition || '50% 50%' } as CSSProperties
      }
    >
      <button
        type="button"
        className="map-preview"
        onClick={() => {
          setZoom(false)
          dialog.current?.showModal()
        }}
        aria-label={copy.locations.mapOpen}
      >
        <img
          src={src}
          alt={alt}
          width={map.width}
          height={map.height}
          loading="lazy"
          decoding="async"
        />
        <span>{copy.locations.mapOpen} ↓</span>
      </button>
      <dialog
        ref={dialog}
        className="map-dialog"
        aria-label={copy.locations.mapTitle}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close()
        }}
      >
        <div className="map-toolbar">
          <button type="button" onClick={() => setZoom((v) => !v)}>
            {zoom ? copy.locations.mapUnzoom : copy.locations.mapZoom}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => dialog.current?.close()}
          >
            {copy.locations.mapClose} ×
          </button>
        </div>
        <div className="map-scroll">
          <img className={zoom ? 'zoomed' : ''} src={src} alt={alt} />
        </div>
      </dialog>
    </div>
  )
}
export function Locations({ type }: { type: InvitationType }) {
  const { ceremony } = invitationFlags(type)
  return (
    <section
      id="ubicaciones"
      className="locations"
      aria-labelledby="locations-title"
    >
      <div className="section-wrap">
        <Reveal className="locations-heading">
          <div>
            <p className="eyebrow">{copy.locations.eyebrow}</p>
            <h2 id="locations-title">{copy.locations.title}</h2>
          </div>
          <a className="parking-preview" href="#estacionamiento">
            <span className="parking-preview-icon" aria-hidden="true">
              P
            </span>
            <span>
              <strong>{copy.locations.parkingPreview}</strong>
              <small>{copy.locations.parkingAddress}</small>
            </span>
            <span aria-hidden="true">↓</span>
          </a>
        </Reveal>
        <div className={`location-list ${ceremony ? '' : 'single-location'}`}>
          {ceremony && (
            <Reveal className="location">
              <p className="eyebrow">{copy.locations.ceremony}</p>
              <h3>{event.ceremony.name}</h3>
              <address>{event.ceremony.address}</address>
              <NavigationLinks {...event.ceremony} />
            </Reveal>
          )}
          <Reveal className="location">
            <p className="eyebrow">{copy.locations.venue}</p>
            <h3>{event.venue.name}</h3>
            <address>{event.venue.address}</address>
            {event.eventEntranceDescription && (
              <p>{event.eventEntranceDescription}</p>
            )}
            <NavigationLinks {...event.venue} />
          </Reveal>
        </div>
        <EventMap ceremony={ceremony} />
        <Reveal className="parking" id="estacionamiento">
          <div className="parking-heading">
            <span className="parking-icon" aria-hidden="true">
              P
            </span>
            <div>
              <p className="eyebrow">{copy.locations.parkingFree}</p>
              <h3>{copy.locations.parkingTitle}</h3>
            </div>
          </div>
          <div className="parking-information">
            <div className="parking-location">
              <address>{copy.locations.parkingAddress}</address>
              <p>
                {ceremony
                  ? copy.locations.ceremonyParking
                  : copy.locations.parking}
              </p>
              <NavigationLinks
                {...event.venue}
                name={copy.locations.parkingTitle}
              />
            </div>
            <div className="parking-duration">
              <h4>{copy.locations.parkingOvernight}</h4>
              <p>{copy.locations.parkingDetail}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
