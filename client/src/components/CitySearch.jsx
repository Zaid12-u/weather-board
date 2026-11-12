import { useEffect, useId, useRef, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { searchCities } from '../services/geocoding'

function formatCityLabel(city) {
  return [city.name, city.admin1, city.country].filter(Boolean).join(', ')
}

/**
 * @param {{ onSelect: (city: object) => void }} props
 */
export default function CitySearch({ onSelect }) {
  const inputId = useId()
  const listboxId = useId()
  const errorId = useId()
  const rootRef = useRef(null)
  const abortRef = useRef(null)

  const [query, setQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | results | empty | network | api
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [validationError, setValidationError] = useState('')
  const [retryToken, setRetryToken] = useState(0)

  const debouncedQuery = useDebounce(query, 300)
  const trimmedDebounced = debouncedQuery.trim()

  useEffect(() => {
    if (
      selectedCity &&
      formatCityLabel(selectedCity) === trimmedDebounced
    ) {
      setSuggestions([])
      setStatus('idle')
      setActiveIndex(-1)
      return
    }

    if (trimmedDebounced.length < 2) {
      if (abortRef.current) {
        abortRef.current.abort()
        abortRef.current = null
      }
      setSuggestions([])
      setStatus('idle')
      setActiveIndex(-1)
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    setStatus('loading')
    setOpen(true)
    setActiveIndex(-1)

    searchCities(trimmedDebounced, controller.signal)
      .then((cities) => {
        setSuggestions(cities)
        setStatus(cities.length === 0 ? 'empty' : 'results')
        setOpen(true)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setSuggestions([])
        setStatus(err?.type === 'network' ? 'network' : 'api')
        setOpen(true)
      })

    return () => {
      controller.abort()
    }
  }, [trimmedDebounced, retryToken, selectedCity])

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [])

  function validateOnBlur() {
    const trimmed = query.trim()
    if (!trimmed) {
      setValidationError('Enter a city name to search.')
      return
    }
    if (!selectedCity) {
      setValidationError('Select a city from the suggestions.')
      return
    }
    setValidationError('')
  }

  function handleSelect(city) {
    setSelectedCity(city)
    setQuery(formatCityLabel(city))
    setSuggestions([])
    setStatus('idle')
    setOpen(false)
    setActiveIndex(-1)
    setValidationError('')
    onSelect?.(city)
  }

  function handleChange(event) {
    setQuery(event.target.value)
    setSelectedCity(null)
    setValidationError('')
    setOpen(true)
  }

  function handleKeyDown(event) {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp') && suggestions.length > 0) {
      setOpen(true)
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      setActiveIndex(-1)
      return
    }

    if (!open) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (status !== 'results' || suggestions.length === 0) return
      setActiveIndex((prev) => (prev + 1) % suggestions.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (status !== 'results' || suggestions.length === 0) return
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
      return
    }

    if (event.key === 'Enter') {
      if (status === 'results' && activeIndex >= 0 && suggestions[activeIndex]) {
        event.preventDefault()
        handleSelect(suggestions[activeIndex])
      }
    }
  }

  function handleRetry() {
    setRetryToken((n) => n + 1)
  }

  const showDropdown =
    open &&
    trimmedDebounced.length >= 2 &&
    (status === 'loading' ||
      status === 'results' ||
      status === 'empty' ||
      status === 'network' ||
      status === 'api')

  const isInvalid = Boolean(validationError)

  return (
    <div ref={rootRef} className="relative w-full max-w-xl">
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-neutral-300">
        Search city
      </label>
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 && suggestions[activeIndex]
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? errorId : undefined}
        autoComplete="off"
        placeholder="Type at least 2 characters…"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (trimmedDebounced.length >= 2 && status !== 'idle') setOpen(true)
        }}
        onBlur={validateOnBlur}
        className="min-h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:border-red-500 aria-[invalid=true]:focus:ring-red-500"
      />

      {validationError ? (
        <p id={errorId} className="mt-2 text-sm text-red-400" role="alert">
          {validationError}
        </p>
      ) : null}

      {showDropdown ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="City suggestions"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 shadow-lg"
        >
          {status === 'loading' ? (
            <div className="space-y-2 p-3" aria-busy="true" aria-live="polite">
              <div className="flex min-h-11 items-center gap-3">
                <span className="size-5 shrink-0 animate-spin rounded-full border-2 border-neutral-600 border-t-neutral-300" />
                <span className="text-sm text-neutral-400">Searching cities…</span>
              </div>
              <div className="h-11 animate-pulse rounded-md bg-neutral-800" />
              <div className="h-11 animate-pulse rounded-md bg-neutral-800" />
            </div>
          ) : null}

          {status === 'results'
            ? suggestions.map((city, index) => {
                const label = formatCityLabel(city)
                const isActive = index === activeIndex
                return (
                  <button
                    key={city.id}
                    id={`${listboxId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={`flex min-h-11 w-full items-center px-3 py-2 text-left text-sm text-neutral-100 ${
                      isActive ? 'bg-neutral-800' : 'hover:bg-neutral-800/80'
                    }`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(city)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    {label}
                  </button>
                )
              })
            : null}

          {status === 'empty' ? (
            <p className="min-h-11 px-3 py-3 text-sm text-neutral-400" role="status">
              No cities found for &lsquo;{trimmedDebounced}&rsquo;. Check the spelling or try a nearby
              city.
            </p>
          ) : null}

          {status === 'network' ? (
            <div className="space-y-3 p-3" role="alert">
              <p className="text-sm text-neutral-300">
                You appear to be offline. Check your connection and try again.
              </p>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleRetry}
                className="min-h-11 rounded-md border border-neutral-600 bg-neutral-800 px-3 text-sm text-neutral-100 hover:bg-neutral-700"
              >
                Retry
              </button>
            </div>
          ) : null}

          {status === 'api' ? (
            <div className="space-y-3 p-3" role="alert">
              <p className="text-sm text-neutral-300">
                The city search service is not responding. Try again in a moment.
              </p>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleRetry}
                className="min-h-11 rounded-md border border-neutral-600 bg-neutral-800 px-3 text-sm text-neutral-100 hover:bg-neutral-700"
              >
                Retry
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
