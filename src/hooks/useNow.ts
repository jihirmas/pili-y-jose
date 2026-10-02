import { useEffect, useState } from 'react'
export function useNow(interval = 1000) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), interval)
    const update = () => setNow(Date.now())
    document.addEventListener('visibilitychange', update)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', update)
    }
  }, [interval])
  return now
}
