import { useEffect, useState } from 'react'
import { getWeather } from '../services/weather'

/**
 * @param {{ id?: number, latitude: number, longitude: number } | null} city
 */
export function useWeather(city) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(city))
  const [error, setError] = useState(null)
  const [retryToken, setRetryToken] = useState(0)

  const latitude = city?.latitude
  const longitude = city?.longitude

  useEffect(() => {
    if (latitude == null || longitude == null) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    getWeather({ latitude, longitude }, controller.signal)
      .then((weather) => {
        setData(weather)
        setLoading(false)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setData(null)
        setError({ type: err?.type === 'network' ? 'network' : 'api' })
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [latitude, longitude, retryToken])

  function refetch() {
    setRetryToken((n) => n + 1)
  }

  return { data, loading, error, refetch }
}
