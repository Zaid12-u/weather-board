import { useEffect, useState } from 'react'
import { getWeather } from '../services/weather'
import { safeGet, safeSet } from '../utils/storage'

const LAST_WEATHER_KEY = 'weatherboard:lastWeather'

/**
 * @param {{ id?: number, latitude: number, longitude: number } | null} city
 */
export function useWeather(city) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(city))
  const [error, setError] = useState(null)
  const [offlineSavedAt, setOfflineSavedAt] = useState(null)
  const [retryToken, setRetryToken] = useState(0)

  const latitude = city?.latitude
  const longitude = city?.longitude
  const cityId = city?.id

  useEffect(() => {
    if (latitude == null || longitude == null) {
      setData(null)
      setLoading(false)
      setError(null)
      setOfflineSavedAt(null)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setOfflineSavedAt(null)

    getWeather({ latitude, longitude }, controller.signal)
      .then((weather) => {
        setData(weather)
        setLoading(false)
        setError(null)
        setOfflineSavedAt(null)
        safeSet(LAST_WEATHER_KEY, {
          cityId,
          data: weather,
          savedAt: new Date().toISOString(),
        })
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return

        if (err?.type === 'network') {
          const saved = safeGet(LAST_WEATHER_KEY, null)
          if (saved && saved.cityId === cityId && saved.data) {
            setData(saved.data)
            setOfflineSavedAt(saved.savedAt)
            setError(null)
            setLoading(false)
            return
          }
        }

        setData(null)
        setOfflineSavedAt(null)
        setError({ type: err?.type === 'network' ? 'network' : 'api' })
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [latitude, longitude, cityId, retryToken])

  function refetch() {
    setRetryToken((n) => n + 1)
  }

  return { data, loading, error, refetch, offlineSavedAt }
}
