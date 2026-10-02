export const runtime = {
  appsScriptUrl: import.meta.env.VITE_APPS_SCRIPT_URL || '',
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
  siteUrl: import.meta.env.VITE_SITE_URL || '', // TODO_FINAL_DOMAIN
}
export const isAppsScriptUrl = (url: string) =>
  /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url)
