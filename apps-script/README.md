# Backend Google Apps Script

Copia `Code.gs` y `appsscript.json` a un proyecto de Apps Script. No se ejecuta con Node ni se despliega como parte del sitio estático.

Las instrucciones completas están en [Google Sheets setup](../docs/GOOGLE_SHEETS_SETUP.md). `Code.test.ts` prueba el código `.gs` real con servicios de Google simulados mediante `npm test`; no se copia a Google.

El servidor vuelve a resolver el token, valida campos por variante, verifica reCAPTCHA y su hostname, aplica el cierre con reloj de Google y serializa el chequeo de duplicados más escritura con `LockService`. Guarda solo las 16 columnas especificadas. Los logs contienen código y clase de error, sin contactos, tokens ni payloads.

`setupSheet()` crea la hoja y encabezados si hacen falta, congela la primera fila y ajusta timezone. Reejecutarlo no borra filas. Falla si ya existen encabezados incompatibles. No renombres/reordenes columnas sin actualizar el código.

El HTML de respuesta contiene exclusivamente el marcador, nonce, éxito y código. `ALLOWALL` permite embeberlo; el mensaje se dirige exclusivamente a `PARENT_ORIGIN`. No devuelve datos personales, códigos de reserva ni IDs ficticios al cliente.
