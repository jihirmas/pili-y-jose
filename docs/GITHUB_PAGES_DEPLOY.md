# Publicar en GitHub Pages

Repositorio previsto: `jihirmas/pili-y-jose`. URL: `https://jihirmas.github.io/pili-y-jose/`.

El nombre del repositorio usa guiones en lugar de espacios. El título visible del sitio sigue siendo Pili & Jose. GitHub Pages ofrece `https://USUARIO.github.io/REPOSITORIO/`; para publicar en `https://USUARIO.github.io/` se usa un repositorio llamado `USUARIO.github.io`. No permite elegir un subdominio gratuito arbitrario como `piliyjose.jihirmas.github.io`. Ver [tipos de sitios de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

La web y sus imágenes se alojan en Pages. Apps Script, reCAPTCHA y Google Sheets siguen atendiendo las confirmaciones: Pages solo sirve archivos estáticos. No se necesita AWS ni comprar un dominio.

## 1. Crear el repositorio y activar Pages

1. En GitHub crea `pili-y-jose` bajo la cuenta `jihirmas`, sin inicializar README ni otros archivos si vas a subir este proyecto existente.
2. Para GitHub Free usa un repositorio público. Pages en repositorios privados requiere un plan compatible. El repositorio incluye las fotos y contactos que aparecen en la web; `.env.local` está excluido de Git.
3. Sube el proyecto a la rama `main` con Git o la opción de publicar repositorio del IDE. No subas `.env.local` ni claves secretas.
4. En **Settings → Pages → Build and deployment → Source**, elige **GitHub Actions**. El workflow ya está en `.github/workflows/deploy.yml`; no agregues otro.
5. Deja **Custom domain** vacío para usar `github.io`. Mantén **Enforce HTTPS** activado.

El primer workflow puede fallar si aún faltan las variables o activar Pages; vuelve a ejecutarlo después de completar los siguientes pasos.

## 2. Variables del environment production

En **Settings → Environments**, crea o abre **production**. Limita sus deployment branches a `main`. El workflow conserva este environment para reutilizar la configuración anterior.

En **Environment variables → Add variable**, agrega:

| Variable                     | Valor                                                       |
| ---------------------------- | ----------------------------------------------------------- |
| `VITE_APPS_SCRIPT_URL`       | URL `/exec` de la implementación de producción              |
| `VITE_RECAPTCHA_SITE_KEY`    | Clave pública del captcha que autoriza `jihirmas.github.io` |
| `VITE_TOKEN_CEREMONY_SINGLE` | Token existente de `.env.local`                             |
| `VITE_TOKEN_CEREMONY_COUPLE` | Token existente de `.env.local`                             |
| `VITE_TOKEN_PARTY_SINGLE`    | Token existente de `.env.local`                             |
| `VITE_TOKEN_PARTY_COUPLE`    | Token existente de `.env.local`                             |
| `VITE_OG_IMAGE`              | Opcional: URL HTTPS de la imagen para compartir             |

Se usan **Variables**, porque el workflow lee `vars.*`. Los valores `VITE_*` terminan en el frontend. `RECAPTCHA_SECRET` se guarda exclusivamente en Google Script Properties.

No hace falta configurar `VITE_SITE_URL` ni `VITE_BASE_PATH` en GitHub: el workflow fija el origen en `https://jihirmas.github.io` y `configure-pages` entrega la ruta `/pili-y-jose/`. Las variables `AWS_*`, `S3_BUCKET` y `CLOUDFRONT_DISTRIBUTION_ID` ya no se usan.

## 3. Cambiar Google de localhost a producción

1. En la configuración del captcha agrega el dominio **`jihirmas.github.io`**, sin protocolo ni ruta, o usa una clave separada para producción. Copia su site key al environment `production` de GitHub.
2. En Apps Script → **Configuración del proyecto → Propiedades**, configura **`PARENT_ORIGIN=https://jihirmas.github.io`**. No incluyas `/pili-y-jose/` ni barra final.
3. Si usas otra clave de captcha, actualiza `RECAPTCHA_SECRET` con su secret key correspondiente.
4. Conserva los cuatro `TOKEN_*` iguales a los `VITE_TOKEN_*` de GitHub.
5. La implementación debe seguir ejecutándose como su propietario y permitir acceso a cualquier persona. Usa su URL `/exec`.

Las propiedades se leen en cada petición; cambiar solo propiedades no requiere publicar otra versión de código. Si cambias `Code.gs`, sí debes implementar una nueva versión.

El proyecto actual acepta un único `PARENT_ORIGIN`. Al cambiarlo de localhost a Pages, la confirmación local deja de funcionar contra esa implementación. Para usar ambas simultáneamente, crea un proyecto y hoja de prueba separados con origen local; no cambies la implementación de producción entre cada prueba.

## 4. Publicar y verificar

1. En **Actions**, abre **Deploy wedding site to GitHub Pages → Run workflow → main**. También se ejecuta al hacer push a `main`.
2. El workflow instala dependencias, ejecuta lint y tests, valida configuración, compila con la ruta de Pages y publica `dist/` usando las acciones oficiales. La ejecución muestra la URL publicada en el environment `production`.
3. Abre `https://jihirmas.github.io/pili-y-jose/?i=TU_TOKEN`. Sin token verás la pantalla de enlace inválido: es el comportamiento previsto.
4. Comprueba fotos, ambos mapas, estilos y navegación. Prueba los cuatro enlaces de [INVITATION_LINKS.md](INVITATION_LINKS.md).
5. Envía una confirmación con captcha desde Pages y verifica la fila en Sheets; vuelve a intentarlo para comprobar el duplicado.

Para verificar localmente el build con la ruta del repositorio:

```bash
VITE_SITE_URL=https://jihirmas.github.io npm run check:deploy
VITE_BASE_PATH=/pili-y-jose/ npm run build
VITE_BASE_PATH=/pili-y-jose/ npm run preview
```

Abre `http://127.0.0.1:4173/pili-y-jose/?i=TU_TOKEN`. Esta prueba comprueba el build, no autoriza el envío a un backend cuyo `PARENT_ORIGIN` sea Pages. `npm run test:browser` verifica automáticamente las cuatro variantes y la carga de fotos/mapas bajo una subruta usando tokens de prueba.

Referencias: [workflow oficial de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Vite en GitHub Pages](https://vite.dev/guide/static-deploy#github-pages).
