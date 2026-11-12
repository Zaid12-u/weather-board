import { useState } from 'react'
import CitySearch from './components/CitySearch'

function App() {
  const [selectedCity, setSelectedCity] = useState(null)

  return (
    <div className="min-h-dvh overflow-x-hidden bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold tracking-tight text-neutral-50 sm:text-xl">
          WeatherBoard
        </h1>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <CitySearch onSelect={setSelectedCity} />

        {selectedCity ? (
          <p className="mt-6 text-sm text-neutral-300 sm:text-base">
            {selectedCity.name}, {selectedCity.country} — {selectedCity.latitude},{' '}
            {selectedCity.longitude}
          </p>
        ) : null}
      </main>
    </div>
  )
}

export default App
