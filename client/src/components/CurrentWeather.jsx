import { Droplets, Thermometer, Wind } from 'lucide-react'
import { useUnit } from '../context/UnitContext'
import { formatTemp } from '../utils/units'
import { getWeatherDisplay } from '../utils/weatherCodes'

/**
 * @param {{
 *   city: {
 *     name: string,
 *     admin1?: string | null,
 *     country?: string | null,
 *   },
 *   current: {
 *     temp: number,
 *     feelsLike: number,
 *     humidity: number,
 *     windSpeed: number,
 *     code: number,
 *     isDay: boolean,
 *   },
 *   units: {
 *     temp: string,
 *     feelsLike: string,
 *     humidity: string,
 *     windSpeed: string,
 *   },
 *   favouriteButton?: import('react').ReactNode,
 * }} props
 */
export default function CurrentWeather({ city, current, units, favouriteButton }) {
  const { unit } = useUnit()
  const { label, icon: Icon } = getWeatherDisplay(current.code, current.isDay)
  const location = [city.name, city.admin1, city.country].filter(Boolean).join(', ')
  const unitLabel = unit === 'f' ? 'F' : 'C'

  return (
    <section aria-labelledby="current-weather-heading" className="w-full min-w-0">
      <div className="flex items-start justify-between gap-3">
        <h2
          id="current-weather-heading"
          className="min-w-0 text-xl font-semibold text-neutral-50 sm:text-2xl"
        >
          {location}
        </h2>
        {favouriteButton}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4 sm:gap-6">
        <p className="text-5xl font-semibold tracking-tight text-neutral-50 sm:text-6xl">
          {formatTemp(current.temp, unit).replace('°', '')}
          <span className="text-3xl font-medium text-neutral-400 sm:text-4xl">
            °{unitLabel}
          </span>
        </p>
        <div className="flex min-h-11 items-center gap-2 text-neutral-200">
          <Icon className="size-8 shrink-0 text-neutral-300 sm:size-10" aria-hidden="true" />
          <span className="text-base sm:text-lg">{label}</span>
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <li className="flex min-h-11 items-center gap-3 text-sm text-neutral-300 sm:text-base">
          <Thermometer className="size-5 shrink-0 text-neutral-500" aria-hidden="true" />
          <span>
            Feels like {formatTemp(current.feelsLike, unit)}
            {unitLabel}
          </span>
        </li>
        <li className="flex min-h-11 items-center gap-3 text-sm text-neutral-300 sm:text-base">
          <Droplets className="size-5 shrink-0 text-neutral-500" aria-hidden="true" />
          <span>
            Humidity {current.humidity}
            {units.humidity}
          </span>
        </li>
        <li className="flex min-h-11 items-center gap-3 text-sm text-neutral-300 sm:text-base">
          <Wind className="size-5 shrink-0 text-neutral-500" aria-hidden="true" />
          <span>
            Wind {Math.round(current.windSpeed)} {units.windSpeed}
          </span>
        </li>
      </ul>
    </section>
  )
}