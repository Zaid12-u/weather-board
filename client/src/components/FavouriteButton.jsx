import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

/**
 * @param {{
 *   city: {
 *     id: number,
 *     name: string,
 *     admin1?: string | null,
 *     country?: string | null,
 *     latitude: number,
 *     longitude: number,
 *     timezone?: string | null,
 *   },
 *   isFavourite: boolean,
 *   addFavourite: (city: object) => { ok: true } | { ok: false, reason: string },
 *   removeFavourite: (id: number) => void,
 * }} props
 */
export default function FavouriteButton({ city, isFavourite, addFavourite, removeFavourite }) {
  const [limitMessage, setLimitMessage] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    setLimitMessage('')
    setConfirmOpen(false)
  }, [city.id])

  function handleClick() {
    if (isFavourite) {
      setLimitMessage('')
      setConfirmOpen(true)
      return
    }

    const result = addFavourite(city)
    if (!result.ok && result.reason === 'limit') {
      setLimitMessage('You can save up to 5 cities. Remove one to add another.')
      return
    }
    setLimitMessage('')
  }

  function handleConfirmRemove() {
    removeFavourite(city.id)
    setConfirmOpen(false)
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isFavourite}
        aria-label={isFavourite ? `Remove ${city.name} from favourites` : `Save ${city.name} to favourites`}
        className="inline-flex size-11 items-center justify-center rounded-md text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50"
      >
        <Star
          className={`size-6 ${isFavourite ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'}`}
          aria-hidden="true"
        />
      </button>

      {limitMessage ? (
        <p className="absolute right-0 top-full z-10 mt-2 w-56 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-300 shadow-lg sm:w-64" role="status">
          {limitMessage}
        </p>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title={`Remove ${city.name} from favourites?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmRemove}
      />
    </div>
  )
}
