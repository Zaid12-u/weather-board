import { useEffect, useState } from 'react'
import CitySearch from './components/CitySearch'
import CurrentWeather from './components/CurrentWeather'
import EmptyState from './components/EmptyState'
import ErrorState from './components/ErrorState'
import Forecast from './components/Forecast'
import WeatherSkeleton from './components/WeatherSkeleton'
import { useWeather } from './hooks/useWeather'

const LAST_CITY_KEY = 'weatherboard:lastCity'

function readLastCity() {
  try {
    const raw = localStorage.getItem(LAST_CITY_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed.latitude === 'number' &&
      typeof parsed.longitude === 'number' &&
      typeof parsed.name === 'string'
    ) {
      return parsed
    }
  } catch {
    // ignore quota / private mode / bad JSON
  }
  return null
}

function writeLastCity(city) {
  try {
    localStorage.setItem(LAST_CITY_KEY, JSON.stringify(city))
  } catch {
    // ignore quota / private mode
  }
}

function App() {
  const [selectedCity, setSelectedCity] = useState(readLastCity)
  const { data, loading, error, refetch } = useWeather(selectedCity)

  useEffect(() => {
    if (selectedCity) writeLastCity(selectedCity)
  }, [selectedCity])

  function handleSelectCity(city) {
    setSelectedCity(city)
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold tracking-tight text-neutral-50 sm:text-xl">
          WeatherBoard
        </h1>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <CitySearch onSelect={handleSelectCity} />

        <div className="mt-8">
          {!selectedCity ? <EmptyState /> : null}

          {selectedCity && loading ? <WeatherSkeleton /> : null}

          {selectedCity && !loading && error ? (
            <ErrorState type={error.type} onRetry={refetch} />
          ) : null}

          {selectedCity && !loading && !error && data ? (
            <div className="space-y-8">
              <CurrentWeather
                city={selectedCity}
                current={data.current}
                units={data.units}
              />
              <Forecast daily={data.daily} units={data.units} />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}

export default App
