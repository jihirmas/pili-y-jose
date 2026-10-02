# Pili & Jose · 9 de enero de 2027

Sitio estático en React + Vite + TypeScript, CSS propio, Motion, React Hook Form y Zod. RSVP con reCAPTCHA v2, Google Apps Script y una única hoja de Google Sheets. Sin cuentas, base de invitados, analytics ni backend Node.

## Ejecutar localmente

Requiere Node 22.12+ (se usa Node 24 en CI).

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Abre `http://127.0.0.1:5173/?preview=ceremony_couple`. Las otras vistas son `ceremony_single`, `party_single` y `party_couple`. El inicio sin token muestra la pantalla de enlace inválido, también en desarrollo. `preview` solo funciona con el servidor de desarrollo; nunca en el build de producción.

Para revisar la tarjeta confirmada sin completar ni enviar el formulario, abre `http://127.0.0.1:5173/?preview=party_single&rsvp=success&name=Camila%20P%C3%A9rez&email=camila%40ejemplo.cl#confirmar`. Esta simulación solo existe en desarrollo.

Los previews permiten revisar los campos sin Google configurado; no simulan guardados ni muestran éxito ficticio. Para enviar realmente, configura Google y entra con `?i=<TOKEN>`.

```bash
npm test                 # lógica, renderizado, transporte y Apps Script
npm run lint
npm run build            # incluye revisión TypeScript
npm run preview          # sirve dist; requiere enlace con token
npm run test:browser     # responsive en Chrome instalado
npm run generate:tokens  # imprime cuatro tokens; no guarda archivos
npm run check:deploy     # falla hasta completar la configuración real
```

Para los tests de navegador, instala Chrome o ejecuta `npx playwright install chrome`. Sus capturas quedan en `test-results/`, fuera de Git.

## Archivos relevantes

| Ruta                           | Contenido                                                              |
| ------------------------------ | ---------------------------------------------------------------------- |
| `src/config/event.ts`          | Datos definitivos, textos editables, contenidos opcionales y sus flags |
| `src/config/invitations.ts`    | Resolución de los cuatro tokens y preview solo DEV                     |
| `src/config/runtime.ts`        | Integración y dominio                                                  |
| `src/styles/`                  | Colores, composición responsive y fuentes alojadas localmente          |
| `src/sections/`                | Portada, itinerario, ubicaciones y secciones opcionales                |
| `src/features/rsvp/`           | Esquema, formulario, captcha y transporte con ACK                      |
| `apps-script/`                 | Backend para copiar a Google y pruebas del `.gs` real                  |
| `.github/workflows/deploy.yml` | Build, validación y publicación mediante OIDC                          |
| `docs/`                        | Configuración manual de Google/GitHub Pages y contenido pendiente      |

## Configuración

Copia `.env.example` a `.env.local` y completa:

- `VITE_APPS_SCRIPT_URL`: URL `/exec` del Web App.
- `VITE_RECAPTCHA_SITE_KEY`: clave pública reCAPTCHA v2 Checkbox.
- `VITE_TOKEN_CEREMONY_SINGLE`, `VITE_TOKEN_CEREMONY_COUPLE`, `VITE_TOKEN_PARTY_SINGLE`, `VITE_TOKEN_PARTY_COUPLE`: generados por `npm run generate:tokens`.
- `VITE_SITE_URL`: origen final HTTPS, sin slash final; debe coincidir con `PARENT_ORIGIN`. En GitHub Actions se detecta desde Pages (para este repositorio: `https://jihirmas.github.io`).
- `VITE_BASE_PATH`: `/` en desarrollo. El workflow detecta automáticamente `/pili-y-jose/` al publicar.
- `VITE_OG_IMAGE`: opcional, URL HTTPS de la imagen final para compartir.

**Las variables `VITE_*` son públicas y quedan en el bundle.** Los cuatro tokens solo seleccionan una variante; no son autenticación, pueden compartirse e inspeccionarse. No guardes claves secretas allí. `RECAPTCHA_SECRET` vive exclusivamente en Script Properties de Google. Ningún token real se versiona.

El formulario cierra a las **00:00 del 10 de diciembre de 2026 en Santiago**. Google lo verifica con su propio reloj, incluso después de adquirir el lock. El countdown cuenta a las 17:30 del 9 de enero de 2027 para las cuatro variantes, sin mostrar ese horario en las invitaciones solo fiesta.

## Antes de publicar

1. Sigue [Google Sheets y reCAPTCHA](docs/GOOGLE_SHEETS_SETUP.md) y realiza una confirmación real de prueba.
2. Completa [GitHub Pages](docs/GITHUB_PAGES_DEPLOY.md). Activa Pages y completa las variables en GitHub.
3. Revisa [contenido pendiente](docs/CONTENT_TODO.md) y [enlaces de invitación](docs/INVITATION_LINKS.md).
4. Ejecuta `npm run check:deploy`, tests, lint y build con las variables finales.
5. Comprueba en incógnito desde el dominio final: captcha, ACK, fila guardada, duplicado y las cuatro variantes.

## Decisiones de integración

El envío usa un formulario HTML POST a un iframe oculto. Solo un ACK con origen Google permitido, fuente perteneciente al iframe de ese intento, nonce activo y código coherente puede producir éxito. `iframe.onload` no confirma nada. A los 15 segundos sin ACK aparece un error y se conservan los datos. Si Google alcanzó a guardar antes del timeout, reintentar devuelve duplicado; el sitio no inventa una confirmación ni modifica filas.

HtmlService crea un iframe anidado: el servidor usa `window.top.postMessage` con el origen exacto configurado y el receptor comprueba la pertenencia del emisor al iframe esperado, incluido su sandbox. Es la adaptación necesaria al [sandbox documentado de Google](https://developers.google.com/apps-script/guides/html/restrictions). No se acepta cualquier mensaje de Google ni se usa `no-cors`.

Los tests con mocks verifican la lógica; no sustituyen la prueba contra tu despliegue real. La web se publica en GitHub Pages; Apps Script y la hoja se configuran por separado en Google. La imagen Open Graph se inserta en HTML durante el build cuando existe `VITE_OG_IMAGE`, para que WhatsApp no dependa de ejecutar JavaScript.

Cada build genera `meta.json` con una versión única. La aplicación lo consulta sin caché al abrirse, al volver a la pestaña y cada minuto. Cuando detecta una publicación nueva, limpia Cache Storage, anula service workers anteriores y recarga la misma invitación con una marca de versión; los assets de Vite también llevan hash.
