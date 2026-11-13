import { useEffect, useRef, useState } from 'react'
import CitySearch from './components/CitySearch'
import CurrentWeather from './components/CurrentWeather'
import EmptyState from './components/EmptyState'
import ErrorState from './components/ErrorState'
import FavouriteButton from './components/FavouriteButton'
import FavouritesPanel from './components/FavouritesPanel'
import Forecast from './components/Forecast'
import OfflineBanner from './components/OfflineBanner'
import ReminderPanel from './components/ReminderPanel'
import ThemeToggle from './components/ThemeToggle'
import UnitToggle from './components/UnitToggle'
import WeatherSkeleton from './components/WeatherSkeleton'
import { useFavourites } from './hooks/useFavourites'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useReminder } from './hooks/useReminder'
import { useReminderSync } from './hooks/useReminderSync'
import { useTheme } from './hooks/useTheme'
import { useWeather } from './hooks/useWeather'
import { safeGet, safeSet } from './utils/storage'

const LAST_CITY_KEY = 'weatherboard:lastCity'

function readLastCity() {
  const parsed = safeGet(LAST_CITY_KEY, null)
  if (
    parsed &&
    typeof parsed.latitude === 'number' &&
    typeof parsed.longitude === 'number' &&
    typeof parsed.name === 'string'
  ) {
    return parsed
  }
  return null
}

function App() {
  const { theme, toggle: toggleTheme } = useTheme()
  const [selectedCity, setSelectedCity] = useState(readLastCity)
  const { data, loading, error, refetch, offlineSavedAt } =
    useWeather(selectedCity)
  const {
    favourites,
    addFavourite,
    removeFavourite,
    isFavourite,
    storageAvailable,
    maxFavourites,
  } = useFavourites()

  const reminder = useReminder()
  useReminderSync({
    settings: reminder.settings,
    permission: reminder.permission,
    city: selectedCity,
  })

  const isOnline = useOnlineStatus()
  const wasOffline = useRef(false)

  useEffect(() => {
    if (selectedCity) safeSet(LAST_CITY_KEY, selectedCity)
  }, [selectedCity])

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true
      return
    }
    if (wasOffline.current) {
      wasOffline.current = false
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline])

  function handleSelectCity(city) {
    setSelectedCity(city)
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-neutral-950 text-neutral-100">
      <OfflineBanner visible={!isOnline} />
      <header className="flex items-center justify-between gap-3 border-b border-neutral-800 px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold tracking-tight text-neutral-50 sm:text-xl">
          WeatherBoard
        </h1>
        <div className="flex items-center gap-2">
          <UnitToggle />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <CitySearch onSelect={handleSelectCity} />

        <div className="mt-8 flex min-w-0 flex-col gap-8 xl:grid xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] xl:items-start xl:gap-10">
          <div className="min-w-0 space-y-6">
            <FavouritesPanel
              favourites={favourites}
              maxFavourites={maxFavourites}
              storageAvailable={storageAvailable}
              onSelect={handleSelectCity}
              onRemove={removeFavourite}
            />
            <ReminderPanel
              supported={reminder.supported}
              permission={reminder.permission}
              settings={reminder.settings}
              update={reminder.update}
              requestPermission={reminder.requestPermission}
            />
          </div>

          <div className="min-w-0">
            {!selectedCity ? <EmptyState /> : null}

            {selectedCity && loading ? <WeatherSkeleton /> : null}

            {selectedCity && !loading && error ? (
              <ErrorState type={error.type} onRetry={refetch} />
            ) : null}

            {selectedCity && !loading && !error && data ? (
              <div className="space-y-8">
                {offlineSavedAt ? (
                  <p className="rounded-md border border-amber-800/80 bg-amber-950/30 px-3 py-2 text-sm text-amber-100">
                    Offline: showing data saved at{' '}
                    {new Date(offlineSavedAt).toLocaleString()}
                  </p>
                ) : null}
                <CurrentWeather
                  city={selectedCity}
                  current={data.current}
                  units={data.units}
                  favouriteButton={
                    <FavouriteButton
                      city={selectedCity}
                      isFavourite={isFavourite(selectedCity.id)}
                      addFavourite={addFavourite}
                      removeFavourite={removeFavourite}
                    />
                  }
                />
                <Forecast daily={data.daily} units={data.units} />
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App