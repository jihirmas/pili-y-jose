declare const __BUILD_VERSION__: string

const VERSION_KEY = 'pili-jose-build-version'
const RELOAD_KEY = '_version'

type BuildMetadata = {
  version: string
}

async function clearBrowserCaches() {
  if ('caches' in window) {
    const names = await window.caches.keys()
    await Promise.all(names.map((name) => window.caches.delete(name)))
  }
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    )
  }
}

export async function loadCurrentBuild(): Promise<boolean> {
  if (import.meta.env.DEV) return true
  try {
    const metadataUrl = new URL('meta.json', document.baseURI)
    metadataUrl.searchParams.set('t', Date.now().toString())
    const response = await fetch(metadataUrl, { cache: 'no-store' })
    if (!response.ok) return true
    const metadata = (await response.json()) as BuildMetadata
    if (!metadata.version || metadata.version === __BUILD_VERSION__) {
      if (metadata.version) localStorage.setItem(VERSION_KEY, metadata.version)
      const currentUrl = new URL(window.location.href)
      if (currentUrl.searchParams.has(RELOAD_KEY)) {
        currentUrl.searchParams.delete(RELOAD_KEY)
        window.history.replaceState(window.history.state, '', currentUrl)
      }
      return true
    }

    localStorage.setItem(VERSION_KEY, metadata.version)
    const nextUrl = new URL(window.location.href)
    if (nextUrl.searchParams.get(RELOAD_KEY) === metadata.version) return true
    await clearBrowserCaches()
    nextUrl.searchParams.set(RELOAD_KEY, metadata.version)
    window.location.replace(nextUrl)
    return false
  } catch {
    // A network failure must not make the invitation unavailable.
    return true
  }
}

export function watchForBuildUpdates() {
  if (import.meta.env.DEV) return () => {}
  let checking = false
  const check = async () => {
    if (checking) return
    checking = true
    await loadCurrentBuild()
    checking = false
  }
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') void check()
  }
  window.addEventListener('focus', check)
  document.addEventListener('visibilitychange', onVisibilityChange)
  const interval = window.setInterval(check, 60_000)
  return () => {
    window.removeEventListener('focus', check)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.clearInterval(interval)
  }
}
