import { copy, event } from '../config/event'
import { Reveal } from '../components/Reveal'
import { GiftOutline, PhotoOutline } from '../components/TravelArtwork'

export function DressCode() {
  const { dressCode } = event
  return (
    <>
      {dressCode.enabled && dressCode.description && (
        <section className="optional-section section-wrap">
          <Reveal>
            <p className="eyebrow">{dressCode.title}</p>
            <h2>{dressCode.description}</h2>
          </Reveal>
        </section>
      )}
    </>
  )
}

export function Gallery() {
  const { gallery } = event
  return (
    <>
      {gallery.enabled && (
        <section
          id="fotos"
          className="gallery section-wrap"
          aria-labelledby="gallery-title"
        >
          <Reveal className="gallery-heading">
            <div>
              <p className="eyebrow">{copy.optional.galleryLabel}</p>
              <h2 id="gallery-title">{copy.optional.gallery}</h2>
            </div>
            {gallery.images.length === 0 && (
              <p>{copy.optional.galleryPending}</p>
            )}
          </Reveal>
          <div className="gallery-grid">
            {gallery.images.length > 0
              ? gallery.images.map((photo, i) => (
                  <Reveal key={photo.src} delay={(i % 3) * 0.14}>
                    <figure className="postcard">
                      <img
                        src={photo.src}
                        srcSet={photo.srcSet}
                        sizes="(max-width: 640px) calc((100vw - 84px) / 2), (max-width: 1160px) calc((100vw - 224px) / 3), 312px"
                        width={photo.width}
                        height={photo.height}
                        alt={photo.alt}
                        loading="lazy"
                        decoding="async"
                        style={{ objectPosition: photo.position || '50% 50%' }}
                      />
                      {photo.caption && (
                        <figcaption>{photo.caption}</figcaption>
                      )}
                    </figure>
                  </Reveal>
                ))
              : [0, 1, 2, 3, 4, 5].map((i) => (
                  <Reveal key={i} delay={(i % 3) * 0.15}>
                    <figure className="postcard photo-placeholder">
                      <div className="photo-space">
                        <PhotoOutline />
                      </div>
                      <figcaption>{copy.optional.photoPending}</figcaption>
                    </figure>
                  </Reveal>
                ))}
          </div>
        </section>
      )}
    </>
  )
}
export function Gifts() {
  const { gifts } = event
  if (!gifts.enabled) return null
  return (
    <section id="regalos" className="gifts-section">
      <Reveal className="gifts-inner section-wrap">
        <div className="gift-art">
          <GiftOutline />
        </div>
        <div>
          <h2>{copy.optional.giftsTitle}</h2>
          <p className="gifts-body">{copy.optional.giftsBody}</p>
          {gifts.registryCode && (
            <p className="registry-code">
              {copy.optional.giftsCode}: <strong>{gifts.registryCode}</strong>
            </p>
          )}
          {gifts.registryUrl ? (
            <a
              className="registry-button"
              href={gifts.registryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.optional.giftsLink} <span aria-hidden="true">↓</span>
            </a>
          ) : (
            <p className="pending-note">{copy.optional.giftsPending}</p>
          )}
          {gifts.homeAddress && (
            <div className="gift-address">
              <p>{copy.optional.giftsAddress}</p>
              <address>{gifts.homeAddress}</address>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  )
}

export function Contact() {
  const contact = event.contact
  if (!contact.enabled) return null
  const phones = [
    { name: event.couple.person1, phone: contact.piliPhone },
    { name: event.couple.person2, phone: contact.josePhone },
    ...(contact.plannerName
      ? [{ name: contact.plannerName, phone: contact.plannerPhone }]
      : []),
  ]
  const hasContact = phones.some((person) => person.phone) || contact.email
  return (
    <section id="contacto" className="contact" aria-labelledby="contact-title">
      <div className="contact-inner section-wrap">
        <Reveal>
          <p className="eyebrow">{event.couple.displayName}</p>
          <h2 id="contact-title">{copy.optional.contact}</h2>
          <p className="contact-intro">
            {hasContact
              ? copy.optional.contactBody
              : copy.optional.contactPending}
          </p>
        </Reveal>
        <div className="contact-links">
          {phones.map((person, index) => (
            <Reveal key={person.name} delay={index * 0.12}>
              <h3>{person.name}</h3>
              {person.phone ? (
                <>
                  <a href={`tel:${person.phone}`}>{person.phone}</a>
                  <a
                    href={`https://wa.me/${person.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {copy.optional.whatsapp} ↓
                  </a>
                </>
              ) : (
                <p className="contact-pending">{copy.optional.phonePending}</p>
              )}
            </Reveal>
          ))}
          {contact.email && (
            <Reveal>
              <h3>{copy.optional.email}</h3>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
