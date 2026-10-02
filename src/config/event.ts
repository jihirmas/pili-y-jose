const imageBase = `${import.meta.env.BASE_URL}images/`

type Photo = {
  src: string
  alt: string
  srcSet?: string
  position?: string
  caption?: string
  width: number
  height: number
}
type MapImage = Photo & {
  partySrc?: string
  partyAlt?: string
  mobilePosition?: string
}

const venueNavigation = {
  maps: 'https://maps.app.goo.gl/cfarR7NEJkDJVNQH7',
  waze: 'https://waze.com/ul/h66jc8rs25',
}

export const event = {
  couple: { person1: 'Pili', person2: 'Jose', displayName: 'Pili & Jose' },
  weddingDate: '2027-01-09',
  ceremonyStart: '2027-01-09T17:30:00-03:00',
  rsvpDeadline: '2026-12-10T00:00:00-03:00',
  timezone: 'America/Santiago',
  dateLabel: '9 de enero de 2027',
  dateShort: '09 · 01 · 2027',
  placeLabel: 'Santiago, Chile',
  destinationLabel: 'Celebración inolvidable',
  ceremony: {
    name: 'Iglesia San Francisco',
    time: '17:30',
    address:
      "Av. Libertador Bernardo O'Higgins 834, Santiago, Región Metropolitana, Chile",
    maps: 'https://maps.app.goo.gl/3Uh5HiofCwY1qeVE8',
  },
  venue: {
    name: 'Alto San Francisco',
    address: 'San Francisco 75, Santiago, Región Metropolitana, Chile',
    ...venueNavigation,
  },
  cocktailTime: '19:00',
  partyTime: '22:00',
  eventEntranceDescription: null as string | null, // TODO: agregar descripción exacta de la entrada a Alto San Francisco.
  mapImage: {
    src: `${imageBase}mapa-san-francisco.png`,
    alt: 'Mapa de Iglesia San Francisco, centro de eventos Alto San Francisco y entrada al estacionamiento, con referencias de las calles Londres, París y San Francisco.',
    width: 2048,
    height: 1030,
    // Preserve all three labels in the central band when the sides are cropped.
    mobilePosition: '40% 50%',
    partySrc: `${imageBase}mapa-solo-fiesta.png`,
    partyAlt:
      'Mapa del centro de eventos Alto San Francisco y entrada al estacionamiento por San Francisco, con referencias de las calles París y Londres.',
  } as MapImage | null,
  dressCode: {
    enabled: false,
    title: 'Dress code',
    description: null as string | null,
  }, // TODO: definir dress code.
  gallery: {
    enabled: true,
    images: [
      {
        src: `${imageBase}648c528c-4e73-4dc2-945e-e28fe8630498.JPG`,
        alt: 'La pareja en un mirador con la ciudad al fondo.',
        width: 960,
        height: 1280,
      },
      {
        src: `${imageBase}36d53fd8-c03c-4bfa-bc72-60ff64988673.JPG`,
        alt: 'La pareja en columpios al aire libre.',
        width: 1536,
        height: 2048,
      },
      {
        src: `${imageBase}55ab33bd-b6ae-412d-b028-8e532c704f5c.JPG`,
        alt: 'La pareja con los brazos levantados frente a un castillo.',
        width: 1537,
        height: 2305,
        position: '50% 55%',
      },
      {
        src: `${imageBase}476879dc-5af0-410e-b27b-88eb1e10ca21.JPG`,
        alt: 'La pareja abrazada en una foto de noche.',
        width: 2090,
        height: 4029,
        position: '50% 32%',
      },
      {
        src: `${imageBase}14f86bfd-2f6c-4606-8bfd-44d0002380a5.JPG`,
        alt: 'La pareja junto al robot BB-8.',
        width: 3024,
        height: 4032,
      },
      {
        src: `${imageBase}3d5954cf-68a0-4625-a512-74d8eea1817e.JPG`,
        alt: 'La pareja en una terraza durante una salida de noche.',
        width: 3024,
        height: 4032,
      },
    ] as Photo[],
  },
  gifts: {
    enabled: true,
    registryUrl: 'https://club.noviosparis.cl/home/couple-catalog/6967868',
    registryCode: '6967868',
    homeAddress: null as string | null,
  }, // Dirección de regalos opcional.
  contact: {
    enabled: true,
    piliPhone: '+56984790653',
    josePhone: '+56972393582',
    email: null as string | null, // TODO_CONTACT_EMAIL
    plannerName: null as string | null, // TODO_WEDDING_PLANNER_NAME
    plannerPhone: null as string | null, // TODO_WEDDING_PLANNER_PHONE
  },
}

export const copy = {
  nav: {
    itinerary: 'El gran día',
    locations: 'Cómo llegar',
    rsvp: 'Confirmar',
    skip: 'Ir al contenido',
  },
  hero: {
    passport: 'Pasaporte',
    stamp: 'Santiago · Chile',
    stampDate: '09 ENE 2027',
    destination: 'Destino',
    title: 'Matrimonio',
    countdown: 'Faltan',
    units: ['Días', 'Horas', 'Min', 'Seg'],
    scroll: 'Ver los detalles',
  },
  itinerary: {
    eyebrow: 'Horarios',
    title: 'El gran día',
    body: 'Te esperamos para celebrar con nosotros.',
    ceremony: 'Ceremonia',
    cocktail: 'Cóctel',
    party: 'Fiesta',
    partyTitle: 'La fiesta',
    partyBody: 'Te esperamos a partir de las 22:00.',
    timePrefix: 'Desde las',
  },
  locations: {
    eyebrow: 'Direcciones',
    title: 'Cómo llegar',
    ceremony: 'La ceremonia',
    venue: 'La celebración',
    parkingTitle: 'Estacionamiento',
    parking:
      'El estacionamiento está en Alto San Francisco, en el mismo centro de eventos.',
    ceremonyParking:
      'Estaciona en Alto San Francisco, a una cuadra de la iglesia.',
    parkingStay:
      'Es gratuito para invitados. Puedes dejar el auto toda la noche y durante todo el día siguiente.',
    parkingFree: 'Gratis para invitados',
    parkingPreview: 'Estacionamiento gratis',
    parkingAddress: 'San Francisco 75',
    parkingOvernight: 'Si prefieres, puedes retirar tu auto al día siguiente',
    parkingDetail:
      'El estacionamiento está disponible toda la noche y durante todo el día siguiente, sin costo para los invitados.',
    mapPending: 'Aquí irá el mapa ilustrado',
    mapPendingDetail:
      'Mientras tanto, puedes usar los enlaces de Google Maps y Waze.',
    maps: 'Google Maps',
    waze: 'Waze',
    mapOpen: 'Ampliar mapa',
    mapClose: 'Cerrar mapa',
    mapZoom: 'Acercar mapa',
    mapUnzoom: 'Ver mapa completo',
    mapTitle: 'Mapa de ubicaciones',
  },
  optional: {
    galleryLabel: 'Álbum de viaje',
    gallery: 'Nuestras fotos',
    galleryPending: 'Pronto sumaremos nuestras fotos aquí.',
    photoPending: 'Foto próximamente',
    giftsTitle: 'Lista de novios',
    giftsBody:
      'Si quieres hacernos un regalo, aquí encontrarás nuestra lista de novios.',
    giftsPending: 'Pronto compartiremos el enlace.',
    giftsLink: 'Ver lista en Novios Paris',
    giftsCode: 'Código de novios Paris',
    giftsAddress: 'Dirección para regalos',
    contact: 'Contacto',
    contactBody: 'Si tienes alguna duda, puedes hablar con nosotros.',
    contactPending: 'Pronto compartiremos nuestros datos de contacto.',
    phonePending: 'Contacto próximamente',
    whatsapp: 'WhatsApp',
    phone: 'Llamar',
    email: 'Escríbenos',
  },
  rsvp: {
    ticketLabel: 'Tarjeta de embarque',
    ticketDestination: 'Destino',
    ticketDate: 'Fecha',
    eyebrow: 'Confirmación',
    title: 'Confirma tu asistencia',
    intro: 'Completa tus datos para confirmar.',
    deadline: 'Confirma hasta el 9 de diciembre de 2026.',
    guestName: 'Nombre y apellido',
    email: 'Email',
    phone: 'Teléfono',
    phoneHint: 'Incluye el código de país si estás fuera de Chile.',
    song: '¿Qué canción no puede faltar?',
    optional: 'Opcional',
    guestDietType: 'Restricción alimentaria',
    guestDietDetail: 'Cuéntanos cuál',
    companionAttending: '¿Vendrás acompañado/a?',
    yes: 'Sí',
    no: 'No',
    companionTitle: 'Tu acompañante',
    companionName: 'Nombre y apellido del acompañante',
    companionDietType: 'Restricción alimentaria del acompañante',
    companionDietDetail: 'Cuéntanos cuál (acompañante)',
    select: 'Selecciona una opción',
    submit: 'Confirmar asistencia',
    validating: 'Revisando tus datos…',
    submitting: 'Guardando tu confirmación…',
    required: '* Campos obligatorios',
    captchaLabel: 'Verificación de seguridad',
    captchaLoading: 'Cargando verificación de seguridad…',
    captchaRetry: 'Volver a cargar verificación',
    unavailable:
      'La confirmación online aún no está disponible. Por favor, vuelve a intentarlo más adelante.',
    preview:
      'Vista previa de desarrollo. Para probar un envío real, configura Google y abre un enlace con token.',
    closed: 'El período de confirmación online ha finalizado.',
    closedDetail: 'Si necesitas contactarnos, escríbenos directamente.',
    validation: 'Revisa los campos indicados para continuar.',
    captchaRequired: 'Completa la verificación de seguridad para continuar.',
    success: {
      eyebrow: 'Check-in completado',
      title: '¡Confirmación recibida!',
      body: 'Gracias por confirmar. ¡Te esperamos!',
      name: 'Nombre',
      email: 'Correo',
    },
    errors: {
      INVALID_INVITE:
        'Esta invitación necesita un enlace válido. Revisa el enlace que recibiste.',
      VALIDATION_ERROR: 'Revisa los datos ingresados e inténtalo nuevamente.',
      CAPTCHA_FAILED:
        'No pudimos validar la verificación de seguridad. Inténtalo nuevamente.',
      DUPLICATE_RSVP:
        'Ya encontramos una confirmación realizada con estos datos. Si necesitas hacer algún cambio, contáctanos directamente.',
      DEADLINE_CLOSED: 'El período de confirmación online ha finalizado.',
      SERVER_ERROR:
        'No pudimos guardar tu confirmación en este momento. Por favor inténtalo nuevamente.',
      TIMEOUT:
        'No pudimos confirmar tu asistencia en este momento. Revisa tu conexión e inténtalo nuevamente.',
    },
  },
  invalid: {
    title: 'Esta invitación necesita un enlace válido.',
    body: 'Revisa el enlace que recibiste e inténtalo nuevamente.',
  },
  validation: {
    required: 'Este campo es obligatorio.',
    name: 'Escribe nombre y apellido.',
    email: 'Ingresa un email válido.',
    phone: 'Ingresa un teléfono válido con entre 7 y 15 dígitos.',
    long: 'El texto es demasiado largo.',
    companion: 'Selecciona si vendrás acompañado/a.',
    diet: 'Selecciona una restricción alimentaria.',
  },
}

export const dietOptions = [
  { value: 'none', label: 'Sin restricciones' },
  { value: 'vegetarian', label: 'Vegetariano/a' },
  { value: 'vegan', label: 'Vegano/a' },
  { value: 'celiac', label: 'Celíaco/a' },
  { value: 'allergy', label: 'Alergia alimentaria' },
  { value: 'other', label: 'Otra' },
] as const
