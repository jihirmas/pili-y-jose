import { loadEnv } from 'vite'
const env = { ...loadEnv('production', process.cwd(), ''), ...process.env }
const errors = []
const tokenNames = [
  'CEREMONY_SINGLE',
  'CEREMONY_COUPLE',
  'PARTY_SINGLE',
  'PARTY_COUPLE',
].map((type) => `VITE_TOKEN_${type}`)
const values = tokenNames.map((name) => env[name])
for (const name of tokenNames)
  if (!/^[\w-]{40,}$/.test(env[name] || ''))
    errors.push(`${name}: genera un token con npm run generate:tokens`)
if (new Set(values).size !== 4)
  errors.push('Los cuatro tokens deben ser diferentes.')
if (
  !/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(
    env.VITE_APPS_SCRIPT_URL || '',
  )
)
  errors.push('VITE_APPS_SCRIPT_URL: falta una URL /exec válida.')
if (!env.VITE_RECAPTCHA_SITE_KEY)
  errors.push('VITE_RECAPTCHA_SITE_KEY: falta configurar.')
try {
  const url = new URL(env.VITE_SITE_URL)
  if (url.protocol !== 'https:' || url.origin !== env.VITE_SITE_URL)
    throw new Error()
} catch {
  errors.push('VITE_SITE_URL: usa el origen HTTPS final, sin barra al final.')
}
if (env.VITE_OG_IMAGE && !/^https:\/\//.test(env.VITE_OG_IMAGE))
  errors.push('VITE_OG_IMAGE debe ser una URL HTTPS.')
if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else
  console.log(
    'Configuración de producción completa. Verifica que tokens y origen coincidan con Apps Script.',
  )
