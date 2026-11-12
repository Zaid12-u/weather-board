import { useState } from 'react'
import { isStorageAvailable, safeGet, safeSet } from '../utils/storage'

const FAVOURITES_KEY = 'weatherboard:favourites'
const MAX_FAVOURITES = 5

function normalizeCity(city) {
  return {
    id: city.id,
    name: city.name,
    admin1: city.admin1 ?? null,
    country: city.country ?? null,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone ?? null,
  }
}

function readFavourites(storageAvailable) {
  if (!storageAvailable) return []
  const stored = safeGet(FAVOURITES_KEY, [])
  return Array.isArray(stored) ? stored : []
}

export function useFavourites() {
  const [storageAvailable] = useState(() => isStorageAvailable())
  const [favourites, setFavourites] = useState(() => readFavourites(isStorageAvailable()))

  function persist(next) {
    if (!storageAvailable) {
      setFavourites(next)
      return true
    }
    const saved = safeSet(FAVOURITES_KEY, next)
    if (!saved) return false
    setFavourites(next)
    return true
  }

  /**
   * @param {object} city
   * @returns {{ ok: true } | { ok: false, reason: 'limit' | 'duplicate' | 'storage' }}
   */
  function addFavourite(city) {
    if (favourites.some((item) => item.id === city.id)) {
      return { ok: false, reason: 'duplicate' }
    }
    if (favourites.length >= MAX_FAVOURITES) {
      return { ok: false, reason: 'limit' }
    }

    const next = [...favourites, normalizeCity(city)]
    const saved = persist(next)
    if (!saved) return { ok: false, reason: 'storage' }
    return { ok: true }
  }

  /**
   * @param {number|string} id
   */
  function removeFavourite(id) {
    const next = favourites.filter((item) => item.id !== id)
    persist(next)
  }

  /**
   * @param {number|string} id
   */
  function isFavourite(id) {
    return favourites.some((item) => item.id === id)
  }

  return {
    favourites,
    addFavourite,
    removeFavourite,
    isFavourite,
    storageAvailable,
    maxFavourites: MAX_FAVOURITES,
  }
}
