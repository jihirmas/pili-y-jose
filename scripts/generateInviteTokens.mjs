import { randomBytes } from 'node:crypto'
const entries = [
  'CEREMONY_SINGLE',
  'CEREMONY_COUPLE',
  'PARTY_SINGLE',
  'PARTY_COUPLE',
].map((name) => [name, randomBytes(32).toString('base64url')])
console.log('Copia estos valores a .env.local y a las variables de GitHub:\n')
for (const [name, value] of entries) console.log(`VITE_TOKEN_${name}=${value}`)
console.log('\nCopia los mismos valores a Script Properties de Apps Script:\n')
for (const [name, value] of entries) console.log(`TOKEN_${name}=${value}`)
console.log('\nNo se ha guardado ningún archivo. No versiones los tokens.')
