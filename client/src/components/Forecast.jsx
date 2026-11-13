import { Droplets } from 'lucide-react'
import { useUnit } from '../context/UnitContext'
import { formatTemp } from '../utils/units'
import { getWeatherDisplay } from '../utils/weatherCodes'

/**
 * @param {{
 *   daily: Array<{
 *     date: string,
 *     code: number,
 *     max: number,
 *     min: number,
 *     rainChance: number,
 *   }>,
 *   units: {
 *     max: string,
 *     min: string,
 *     rainChance: string,
 *   },
 * }} props
 */
export default function Forecast({ daily, units }) {
  const { unit } = useUnit()
  const unitName = unit === 'f' ? 'Fahrenheit' : 'Celsius'

  return (
    <section aria-labelledby="forecast-heading" className="w-full">
      <h2 id="forecast-heading" className="text-lg font-semibold text-neutral-50 sm:text-xl">
        5-day forecast
      </h2>

      <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        {daily.map((day) => {
          const { label, icon: Icon } = getWeatherDisplay(day.code, true)
          const weekday = new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, {
            weekday: 'short',
          })

          return (
            <li
              key={day.date}
              className="flex min-h-[7.5rem] flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3"
            >
              <p className="text-sm font-medium text-neutral-200">{weekday}</p>
              <div className="flex min-h-11 items-center gap-2">
                <Icon className="size-6 shrink-0 text-neutral-300" aria-hidden="true" />
                <span className="sr-only">{label}</span>
              </div>
              <p className="text-sm text-neutral-100">
                <span className="font-medium">{formatTemp(day.max, unit)}</span>
                <span className="text-neutral-500"> / </span>
                <span className="text-neutral-400">{formatTemp(day.min, unit)}</span>
                <span className="sr-only"> high and low in {unitName}</span>
              </p>
              <p className="mt-auto flex min-h-11 items-center gap-1.5 text-xs text-neutral-400">
                <Droplets className="size-3.5 shrink-0" aria-hidden="true" />
                {day.rainChance}
                {units.rainChance} rain
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}