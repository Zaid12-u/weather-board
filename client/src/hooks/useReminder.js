import { useCallback, useState } from 'react'
import { safeGet, safeSet } from '../utils/storage'

const REMINDER_KEY = 'weatherboard:reminder'
const DEFAULTS = { enabled: false, time: '08:00' }

export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator
  )
}

export function useReminder() {
  const supported = isPushSupported()

  const [settings, setSettings] = useState(() => ({
    ...DEFAULTS,
    ...(safeGet(REMINDER_KEY, null) || {}),
  }))

  const [permission, setPermission] = useState(() =>
    supported ? Notification.permission : 'unsupported'
  )

  const update = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      safeSet(REMINDER_KEY, next)
      return next
    })
  }, [])

  // Call this only AFTER the user has read the explanation
  const requestPermission = useCallback(async () => {
    if (!supported) return 'unsupported'
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } catch {
      setPermission('denied')
      return 'denied'
    }
  }, [supported])

  return { supported, permission, settings, update, requestPermission }
}