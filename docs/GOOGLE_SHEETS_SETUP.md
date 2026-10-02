# Google Sheets, Apps Script y reCAPTCHA

## 1. Hoja y proyecto

1. En tu cuenta de Google, crea una hoja de cálculo privada. No la publiques ni la compartas con los invitados.
2. Copia el ID que está entre `/d/` y `/edit` en la URL de Google Sheets.
3. Crea un proyecto **independiente** en [Apps Script](https://script.google.com/). Dale un nombre reconocible, por ejemplo `RSVP Pili y Jose`.
4. Reemplaza `Code.gs` por el archivo `apps-script/Code.gs` del repositorio.
5. En **Configuración del proyecto**, activa **Mostrar el archivo de manifiesto appsscript.json en el editor**. Copia `apps-script/appsscript.json`. La zona horaria debe ser `America/Santiago` y el runtime V8.

## 2. Claves reCAPTCHA

1. En la [consola de reCAPTCHA](https://www.google.com/recaptcha/admin/create), registra el sitio.
2. Selecciona **reCAPTCHA v2 → Casilla «No soy un robot»**. No uses claves v3 ni un widget Enterprise distinto a esta integración.
3. Agrega el dominio final sin protocolo ni ruta, por ejemplo `jihirmas.github.io`; añade los otros hostnames que realmente servirán el sitio. Conserva la validación de dominios activada.
4. Copia la **site key** a `VITE_RECAPTCHA_SITE_KEY` en `.env.local` y en GitHub.
5. Guarda la **secret key** únicamente en Script Properties como `RECAPTCHA_SECRET`. Nunca en variables Vite, repositorio o GitHub.

Si aparece la consola nueva de Google Cloud, el tipo equivalente es **Website · checkbox**. El **Key ID** es la site key. Para obtener la secret key, abre los detalles de la clave → **Integration** → **Use Legacy Key** o **Integrate with a third-party service or plugin**, según la opción disponible. Este proyecto usa la integración existente `siteverify` con site key y secret key; no reemplaces la secret key por una API key de Google Cloud. Consulta la [equivalencia oficial entre consolas](https://docs.cloud.google.com/recaptcha/docs/reconcile-legacy-terminology) y la [creación de claves](https://docs.cloud.google.com/recaptcha/docs/create-key-website).

Google verifica el token mediante `siteverify`; cada token se usa una sola vez y vence a los dos minutos. El frontend reinicia el widget tras cada intento y al expirar. El backend también compara el hostname con `PARENT_ORIGIN`. Consulta la [verificación oficial](https://developers.google.com/recaptcha/docs/verify).

## 3. Script Properties

Copia los cuatro tokens existentes de `.env.local` a las variables de GitHub y sus equivalentes de Apps Script, sin volver a generarlos. En **Configuración del proyecto → Propiedades de la secuencia de comandos → Agregar propiedad**, define:

| Propiedad               | Valor                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `SPREADSHEET_ID`        | ID de la hoja privada                                                                   |
| `SHEET_NAME`            | Nombre exacto de la pestaña, por ejemplo `Confirmaciones`                               |
| `RECAPTCHA_SECRET`      | Clave secreta v2 de Google                                                              |
| `TOKEN_CEREMONY_SINGLE` | Igual a `VITE_TOKEN_CEREMONY_SINGLE`                                                    |
| `TOKEN_CEREMONY_COUPLE` | Igual a `VITE_TOKEN_CEREMONY_COUPLE`                                                    |
| `TOKEN_PARTY_SINGLE`    | Igual a `VITE_TOKEN_PARTY_SINGLE`                                                       |
| `TOKEN_PARTY_COUPLE`    | Igual a `VITE_TOKEN_PARTY_COUPLE`                                                       |
| `PARENT_ORIGIN`         | Origen exacto del frontend, por ejemplo `https://jihirmas.github.io`, sin slash ni ruta |

Para la URL `https://jihirmas.github.io/pili-y-jose/`, usa `PARENT_ORIGIN=https://jihirmas.github.io`: sin la ruta del repositorio ni barra final.

Se usa un solo origen por despliegue. Si agregas `www`, redirígelo al dominio canónico; un ACK destinado al dominio sin `www` no se recibe en `www`. `PARENT_ORIGIN` no se toma del formulario, no acepta `*` y no incluye `?i=...`.

## 4. Preparar encabezados y permisos

1. En el editor, selecciona `setupSheet` en el desplegable de funciones y pulsa **Ejecutar**.
2. Google solicitará autorización al propietario del proyecto: revisar la cuenta y permitir acceso a las hojas de cálculo y solicitudes externas. Es tu propio código; no distribuyas el enlace del editor ni autorizaciones a los invitados.
3. Si tu organización restringe Apps Script o acceso anónimo, el administrador deberá permitirlo o debes usar una cuenta que pueda publicar un Web App anónimo.
4. Vuelve a Sheets. Debe aparecer la pestaña configurada con 16 encabezados, primera fila congelada y zona horaria de Santiago.
5. La función es idempotente. No borra respuestas; si encuentra columnas incompatibles, corrige la hoja antes de reintentarlo.

Los encabezados son:

```text
submitted_at, rsvp_id, invitation_type, event_scope,
invited_with_companion, companion_attending, guest_count,
guest_name, email, phone, guest_diet_type, guest_diet_detail,
companion_name, companion_diet_type, companion_diet_detail, song
```

El timestamp es una fecha real de Sheets con formato local `yyyy-mm-dd hh:mm:ss`, bajo timezone `America/Santiago`. Las columnas booleanas distinguen invitado solo de invitado con acompañante que viene solo. Los tipos alimentarios se guardan como `none`, `vegetarian`, `vegan`, `celiac`, `allergy`, `other`. No se guardan IP, user agent ni token de captcha.

## 5. Publicar Web App

1. Pulsa **Implementar → Nueva implementación**.
2. En el engranaje/tipo, elige **Aplicación web**.
3. **Ejecutar como: Yo**, la cuenta propietaria con acceso a la hoja.
4. **Quién tiene acceso: Cualquier persona**, incluyendo personas sin cuenta de Google. No uses «solo yo» ni «cualquier persona con una cuenta de Google».
5. Implementa y autoriza si Google lo solicita. Copia la URL que termina en **`/exec`**. No uses la URL de pruebas `/dev`.
6. Colócala en `VITE_APPS_SCRIPT_URL`, en `.env.local` y en las variables del environment `production` de GitHub.
7. Cuando cambies `Code.gs` o el manifiesto, usa **Administrar implementaciones → Editar → Nueva versión → Implementar** para mantener la URL. Guardar código en el editor por sí solo no actualiza la versión pública.

Las Script Properties se leen en cada petición. El backend no usa el tipo de invitación enviado por el navegador: deriva el tipo exclusivamente de su propio mapeo de tokens.

## 6. Prueba real obligatoria antes de enviar enlaces

El código se entrega probado localmente con Google simulado. La prueba real requiere tus claves y despliegue:

1. Abre en incógnito el dominio configurado con un token válido. No debería pedir login Google.
2. Completa todos los campos y el captcha. En pareja, prueba primero «No» y luego una confirmación distinta con «Sí».
3. Pulsa **Confirmar asistencia** una vez. Solo aparece el boarding pass tras recibir `RSVP_CREATED`.
4. Verifica en Sheets que se creó exactamente una fila y revisa tipo, scope, booleanos, pasajeros y alimentación.
5. Intenta confirmar nuevamente con el mismo email y teléfono, cambiando espacios, mayúsculas y formato chileno del teléfono. Debe mostrar duplicado sin crear una segunda fila.
6. Prueba los cuatro tipos. En party no deben aparecer iglesia, ceremonia, cóctel ni restricciones alimentarias.
7. Corta la conexión al enviar: debe mostrar error sin borrar datos ni mostrar éxito. Si la fila alcanzó a guardarse, un reintento dará duplicado; revisa la hoja manualmente.
8. Borra manualmente solo las filas que tú identifiques como pruebas antes de distribuir el sitio.

Para probar localmente con Google real, usa un proyecto/hoja y claves de prueba separados. Autoriza `localhost` en reCAPTCHA, usa `PARENT_ORIGIN=http://localhost:5173` y abre ese mismo origen. Si el servidor solo escucha `127.0.0.1`, ejecuta `npm run dev -- --host localhost`. No cambies el origen de producción para una prueba local. Los previews no autorizan envíos; usa un token configurado.

## 7. ACK, cierre y diagnóstico

El POST navega un iframe oculto. HtmlService envuelve la respuesta en su propio iframe de sandbox, de modo que `window.parent` es Google y no React. La respuesta usa `window.top.postMessage` con `PARENT_ORIGIN`; React comprueba que el emisor es el iframe esperado o un descendiente real, que el origen pertenece al sandbox de Apps Script, y que marcador/nonce/estado son correctos. Se configura `XFrameOptionsMode.ALLOWALL`. Consulta [restricciones de HtmlService](https://developers.google.com/apps-script/guides/html/restrictions).

Si hay timeout, revisar `/exec`, acceso anónimo, versión implementada, bloqueo del captcha y coincidencia exacta de `PARENT_ORIGIN`. En **Ejecuciones** de Apps Script aparecen códigos de fallo sin datos personales. Un error de configuración, cuotas de Google o permisos nunca se convierte en éxito.

El cierre real es `2026-12-10T00:00:00-03:00`, incluyendo todo el 9 de diciembre. Se comprueba antes de reCAPTCHA y nuevamente dentro del lock antes de escribir. Para probar un cierre alternativo, usa un proyecto de prueba; restaura siempre la fecha definitiva. Nunca uses el reloj del navegador como autoridad.

El lock protege deduplicación y escritura de este proyecto de Apps Script. No publiques dos proyectos distintos escribiendo simultáneamente en la misma hoja: sus locks no se comparten. No cambies encabezados ni insertes columnas entre las 16 existentes.
