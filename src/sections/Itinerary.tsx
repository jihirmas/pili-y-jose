import { copy, event } from '../config/event'
import { invitationFlags, type InvitationType } from '../config/invitations'
import { Reveal } from '../components/Reveal'

export function Itinerary({ type }: { type: InvitationType }) {
  const { ceremony } = invitationFlags(type)
  const stops = [
    {
      label: copy.itinerary.ceremony,
      time: event.ceremony.time,
      place: event.ceremony.name,
    },
    {
      label: copy.itinerary.cocktail,
      time: event.cocktailTime,
      place: event.venue.name,
    },
    {
      label: copy.itinerary.party,
      time: event.partyTime,
      place: event.venue.name,
    },
  ]
  return (
    <section
      id="nuestro-dia"
      className={`itinerary section-wrap ${ceremony ? '' : 'party-itinerary'}`}
      aria-labelledby="itinerary-title"
    >
      <Reveal className="itinerary-heading">
        <p className="eyebrow">{copy.itinerary.eyebrow}</p>
        <h2 id="itinerary-title">
          {ceremony ? copy.itinerary.title : copy.itinerary.partyTitle}
        </h2>
        <p className="section-description">
          {ceremony ? copy.itinerary.body : copy.itinerary.partyBody}
        </p>
      </Reveal>
      {ceremony ? (
        <ol className="itinerary-stops">
          {stops.map((stop, index) => (
            <li key={stop.label}>
              <Reveal className="schedule-row" delay={index * 0.13}>
                <p className="stop-time">{stop.time}</p>
                <div className="stop-details">
                  <h3>{stop.label}</h3>
                  <p className="stop-place">{stop.place}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      ) : (
        <Reveal className="party-stop">
          <div>
            <p className="eyebrow">
              {copy.itinerary.party} / {copy.itinerary.timePrefix}
            </p>
            <p className="party-time">{event.partyTime}</p>
          </div>
          <div>
            <h3>{event.venue.name}</h3>
          </div>
        </Reveal>
      )}
    </section>
  )
}
