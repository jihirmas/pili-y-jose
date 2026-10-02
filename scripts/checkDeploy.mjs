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
for (const name of tokenNames) {
  const value = env[name] || ''
  const problems = []
  if (!value) {
    problems.push('valor vacío o no disponible para este workflow')
  } else {
    if (value.length < 40)
      problems.push(`demasiado corto: ${value.length} caracteres; mínimo 40`)
    if (/\s/.test(value)) problems.push('contiene espacios o saltos de línea')
    if (/[^\w-]/.test(value))
      problems.push(
        'contiene caracteres distintos de letras, números, guion o guion bajo',
      )
  }
  if (problems.length) {
    errors.push(
      `${name}: ${problems.join('; ')}. Revisa el valor efectivo en Variables del repositorio y del environment production; copia el token existente de .env.local sin regenerarlo.`,
    )
  } else {
    console.log(`${name}: formato válido (${value.length} caracteres).`)
  }
}
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
