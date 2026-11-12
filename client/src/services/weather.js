const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

/**
 * Fetch forecast for a location from Open-Meteo.
 *
 * @param {{ latitude: number, longitude: number }} coords
 * @param {AbortSignal} [signal]
 */
export async function getWeather({ latitude, longitude }, signal) {
  const url = new URL(FORECAST_URL)
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,is_day',
  )
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
  )
  url.searchParams.set('forecast_days', '5')
  url.searchParams.set('timezone', 'auto')

  let response
  try {
    response = await fetch(url.toString(), { signal })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw Object.assign(new Error('Network request failed'), { type: 'network' })
  }

  if (!response.ok) {
    throw Object.assign(new Error(`Weather API responded with ${response.status}`), {
      type: 'api',
    })
  }

  const data = await response.json()
  const current = data.current
  const daily = data.daily

  return {
    current: {
      temp: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      code: current.weather_code,
      isDay: Boolean(current.is_day),
      time: current.time,
    },
    daily: daily.time.map((date, index) => ({
      date,
      code: daily.weather_code[index],
      max: daily.temperature_2m_max[index],
      min: daily.temperature_2m_min[index],
      rainChance: daily.precipitation_probability_max[index],
    })),
    units: {
      temp: data.current_units?.temperature_2m ?? '°C',
      feelsLike: data.current_units?.apparent_temperature ?? '°C',
      humidity: data.current_units?.relative_humidity_2m ?? '%',
      windSpeed: data.current_units?.wind_speed_10m ?? 'km/h',
      max: data.daily_units?.temperature_2m_max ?? '°C',
      min: data.daily_units?.temperature_2m_min ?? '°C',
      rainChance: data.daily_units?.precipitation_probability_max ?? '%',
    },
  }
}
