# Contenido pendiente

Editar `src/config/event.ts`, excepto metadatos indicados abajo. Las seis fotos, la lista de Novios Paris (código 6967868) y los teléfonos de Pili y Jose ya están incorporados. El orden final es confirmación, contacto y álbum, con contacto sobre fondo azul para separar las secciones. Dress code sigue deshabilitado.

- [ ] TODO_DRESS_CODE — `dressCode.description`, luego `enabled: true`.
- [x] TODO_GIFT_REGISTRY_URL — enlace de Novios Paris y `gifts.registryCode` configurados.
- [ ] TODO_GIFT_ADDRESS — `gifts.homeAddress`, si se desea mostrar una dirección para regalos.
- [x] TODO_PILI_PHONE — llamada y WhatsApp configurados.
- [x] TODO_JOSE_PHONE — llamada y WhatsApp configurados.
- [ ] TODO_CONTACT_EMAIL — `contact.email` (opcional).
- [ ] TODO_WEDDING_PLANNER_NAME — `contact.plannerName` (opcional).
- [ ] TODO_WEDDING_PLANNER_PHONE — `contact.plannerPhone` (opcional); se muestra el planner al configurar su nombre y los enlaces al configurar su teléfono.
- [x] TODO_GALLERY_IMAGES — incorporadas las seis fotos recibidas de `public/images/`. Cada entrada de `gallery.images` define archivo, alt, dimensiones y encuadre opcional (`position`). `caption` permite agregar un pie de foto si se desea.
- [ ] TODO_EVENT_ENTRANCE_DESCRIPTION — `eventEntranceDescription`.
- [x] Mapa de ceremonia — imagen recibida en `public/images/mapa-san-francisco.png`. En celular se recortan los costados con foco `40% 50%`; al ampliar se muestra completa.
- [x] TODO_EVENT_MAP_IMAGE — imagen recibida en `public/images/mapa-solo-fiesta.png`, configurada en `mapImage.partySrc` y `partyAlt` para las invitaciones solo fiesta. Mantiene el foco móvil en el centro de eventos y la entrada al estacionamiento.
- [ ] TODO_OG_IMAGE — URL pública HTTPS definitiva en `VITE_OG_IMAGE` (local y GitHub).
- [ ] TODO_FINAL_DOMAIN — activar GitHub Pages para `jihirmas/pili-y-jose`. URL prevista: `https://jihirmas.github.io/pili-y-jose/`. Configurar `PARENT_ORIGIN=https://jihirmas.github.io` y autorizar `jihirmas.github.io` en reCAPTCHA. El workflow detecta `VITE_SITE_URL` y la ruta base automáticamente.

Los contactos de Pili y Jose tienen enlaces reales de llamada y WhatsApp. La lista muestra el enlace y código de Novios Paris. Cada sección se puede ocultar con su flag `enabled: false`.

Los cuatro tokens aleatorios ya están guardados en `.env.local`, excluido de Git. Copiar esos mismos valores a las variables del environment `production` de GitHub y a las propiedades `TOKEN_*` de Apps Script. No regenerarlos al configurar los servicios. La URL de Apps Script y la clave pública de reCAPTCHA ya se configuraron para las pruebas locales. Copiar los valores adecuados a GitHub, configurar el origen de producción en Apps Script y realizar una confirmación desde Pages antes de enviar las invitaciones.

El mapa general puede incluir la iglesia. Para invitaciones solo fiesta se requiere una versión `partySrc` con `partyAlt` que omita la iglesia y la ceremonia. Si falta, se muestra el espacio reservado al mapa junto con las direcciones y navegación, nunca el mapa general. El dibujo del espacio reservado es decorativo y no representa calles reales. Las ilustraciones definitivas deben tener dimensiones reales y alt descriptivo; el diálogo permite ampliar y tiene cierre con Escape y retorno de foco nativo.

Colocar fotos propias optimizadas WebP/AVIF en `public/images/` (las rutas se construyen con `import.meta.env.BASE_URL` para funcionar en Pages). Al reemplazar una imagen, usa un nombre nuevo para evitar versiones anteriores en caché. Las fotografías se cargan de manera diferida. Las fuentes y colores se cambian en `src/styles/fonts.css` y las variables de `src/styles/global.css`.

Los textos importantes están en `event` y `copy`. El cierre y timezone del servidor se editan al inicio de `apps-script/Code.gs`; si cambia la fecha, actualizar ambos archivos y volver a desplegar Apps Script. Los metadatos generales están en `index.html`; la utilidad de Vite inserta la imagen final durante el build.
