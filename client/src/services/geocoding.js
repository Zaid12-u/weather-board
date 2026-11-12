const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

/**
 * Search cities via the configured geocoding provider.
 * Provider details stay in this module so it can be swapped (e.g. GeoDB) later.
 *
 * @param {string} query
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<{
 *   id: number,
 *   name: string,
 *   admin1: string | null,
 *   country: string | null,
 *   countryCode: string | null,
 *   latitude: number,
 *   longitude: number,
 *   timezone: string | null,
 * }>>}
 */
export async function searchCities(query, signal) {
  const url = new URL(GEOCODING_URL)
  url.searchParams.set('name', query)
  url.searchParams.set('count', '6')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  let response
  try {
    response = await fetch(url.toString(), { signal })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw Object.assign(new Error('Network request failed'), { type: 'network' })
  }

  if (!response.ok) {
    throw Object.assign(new Error(`Geocoding API responded with ${response.status}`), {
      type: 'api',
    })
  }

  const data = await response.json()

  if (!Object.hasOwn(data, 'results') || !Array.isArray(data.results)) {
    return []
  }

  return data.results.map((place) => ({
    id: place.id,
    name: place.name,
    admin1: place.admin1 ?? null,
    country: place.country ?? null,
    countryCode: place.country_code ?? null,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone ?? null,
  }))
}
