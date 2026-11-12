import { X } from 'lucide-react'
import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

function formatCityLabel(city) {
  return [city.name, city.admin1, city.country].filter(Boolean).join(', ')
}

/**
 * @param {{
 *   favourites: Array<{
 *     id: number,
 *     name: string,
 *     admin1?: string | null,
 *     country?: string | null,
 *     latitude: number,
 *     longitude: number,
 *     timezone?: string | null,
 *   }>,
 *   maxFavourites?: number,
 *   storageAvailable: boolean,
 *   onSelect: (city: object) => void,
 *   onRemove: (id: number) => void,
 * }} props
 */
export default function FavouritesPanel({
  favourites,
  maxFavourites = 5,
  storageAvailable,
  onSelect,
  onRemove,
}) {
  const [pendingRemove, setPendingRemove] = useState(null)

  return (
    <section
      aria-labelledby="favourites-heading"
      className="w-full min-w-0 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="favourites-heading" className="text-sm font-semibold text-neutral-100 sm:text-base">
          Favourites
        </h2>
        <p className="text-xs text-neutral-400 sm:text-sm" aria-live="polite">
          {favourites.length}/{maxFavourites}
        </p>
      </div>

      {!storageAvailable ? (
        <p className="mt-3 text-xs text-amber-200/90" role="status">
          Favourites can&apos;t be saved on this browser, so they will be lost when you close the tab.
        </p>
      ) : null}

      {favourites.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-400">
          No favourites yet. Tap the star on a city to save it.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {favourites.map((city) => {
            const label = formatCityLabel(city)
            return (
              <li key={city.id} className="flex min-w-0 items-stretch gap-1">
                <button
                  type="button"
                  onClick={() => onSelect(city)}
                  className="min-h-11 min-w-0 flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-left text-sm text-neutral-100 hover:bg-neutral-800"
                >
                  <span className="block truncate font-medium">{city.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-neutral-400">
                    {[city.admin1, city.country].filter(Boolean).join(', ') || label}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${city.name} from favourites`}
                  onClick={() => setPendingRemove(city)}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingRemove)}
        title={
          pendingRemove ? `Remove ${pendingRemove.name} from favourites?` : 'Remove from favourites?'
        }
        onCancel={() => setPendingRemove(null)}
        onConfirm={() => {
          if (pendingRemove) onRemove(pendingRemove.id)
          setPendingRemove(null)
        }}
      />
    </section>
  )
}
