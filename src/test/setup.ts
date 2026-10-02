import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi
    .fn()
    .mockImplementation((query: string) => ({
      matches: query.includes('reduced-motion'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
})
globalThis.IntersectionObserver = class {
  root = null
  rootMargin = ''
  scrollMargin = ''
  thresholds = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
