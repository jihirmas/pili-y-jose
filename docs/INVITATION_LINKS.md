# Enlaces de invitación

Los cuatro tokens ya están generados en `.env.local`, fuera de Git. Copia cada valor existente a su variable `VITE_TOKEN_*` de GitHub y a su Script Property `TOKEN_*` en Apps Script. Compila nuevamente después de cambiarlos. `npm run generate:tokens` solo se necesita para generar un juego nuevo; no lo ejecutes al copiar los actuales.

| Grupo                                      | Enlace a enviar                                                     |
| ------------------------------------------ | ------------------------------------------------------------------- |
| Ceremonia individual                       | `https://jihirmas.github.io/pili-y-jose/?i=<CEREMONY_SINGLE_TOKEN>` |
| Ceremonia con posibilidad de acompañante   | `https://jihirmas.github.io/pili-y-jose/?i=<CEREMONY_COUPLE_TOKEN>` |
| Solo fiesta individual                     | `https://jihirmas.github.io/pili-y-jose/?i=<PARTY_SINGLE_TOKEN>`    |
| Solo fiesta con posibilidad de acompañante | `https://jihirmas.github.io/pili-y-jose/?i=<PARTY_COUPLE_TOKEN>`    |

Repositorio previsto: `jihirmas/pili-y-jose`. La ruta `/pili-y-jose/` forma parte de los enlaces; no la omitas. Los invitados del mismo grupo comparten el enlace; no hay tokens por persona ni listado de invitados. El acompañante es opcional: el formulario exige responder Sí o No. Un invitado individual no puede agregar acompañante por el formulario.

Los tokens son opacos, aleatorios (32 bytes criptográficos, formato base64url) y visibles técnicamente en el frontend. No son secretos de seguridad. No uses `?type=...`. Sin token válido no se muestran datos detallados. Robots y noindex evitan indexación solicitada, no acceso no autorizado.

Para desarrollo únicamente: `http://127.0.0.1:5173/?preview=ceremony_single` y las otras tres variantes. `preview` se ignora al ejecutar `npm run preview` y en GitHub Pages. Antes de distribuir enlaces, prueba los cuatro links de producción y el enlace sin `i`.
