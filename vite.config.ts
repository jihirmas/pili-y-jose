import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  )

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [
      react(),
      {
        name: 'share-metadata',
        transformIndexHtml(html) {
          const url = env.VITE_OG_IMAGE
          const image =
            url && /^https:\/\//.test(url)
              ? `<meta property="og:image" content="${escapeHtml(url)}">`
              : ''
          return html.replace('<!-- OG_IMAGE -->', image)
        },
      },
    ],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}', 'apps-script/**/*.test.ts'],
      restoreMocks: true,
    },
  }
})
