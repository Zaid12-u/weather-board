import { useEffect } from 'react'

async function getRegistration() {
  if (!('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.ready
  } catch {
    return null
  }
}

/**
 * Keeps the service worker in sync with the reminder settings and the
 * currently selected city.
 */
export function useReminderSync({ settings, permission, city }) {
  const active = permission === 'granted' && settings.enabled
  const lat = city?.latitude
  const lon = city?.longitude
  const name = city?.name

  // Send settings to the service worker and register background sync
  useEffect(() => {
    let cancelled = false

    async function sync() {
      const reg = await getRegistration()
      if (!reg || cancelled) return

      reg.active?.postMessage({
        type: 'SET_REMINDER',
        settings: {
          enabled: active,
          time: settings.time,
          city:
            lat != null && lon != null
              ? { name, latitude: lat, longitude: lon }
              : null,
        },
      })

      if ('periodicSync' in reg) {
        try {
          if (active) {
            await reg.periodicSync.register('daily-weather', {
              minInterval: 12 * 60 * 60 * 1000,
            })
          } else {
            await reg.periodicSync.unregister('daily-weather')
          }
        } catch {
          // Not installed / not permitted: the in-app check below still works
        }
      }

      if (active) {
        await new Promise((r) => setTimeout(r, 500))
        if (!cancelled) reg.active?.postMessage({ type: 'CHECK_NOW' })
      }
    }

    sync()
    return () => {
      cancelled = true
    }
  }, [active, settings.time, lat, lon, name])

  // Fallback while the app is open: re-check every minute and on tab focus
  useEffect(() => {
    if (!active) return undefined

    async function check() {
      const reg = await getRegistration()
      reg?.active?.postMessage({ type: 'CHECK_NOW' })
    }

    const id = setInterval(check, 60 * 1000)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', check)
    }
  }, [active])
}