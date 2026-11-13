import { useUnit } from '../context/UnitContext'

export default function UnitToggle() {
  const { unit, setUnit } = useUnit()

  const base = 'min-h-11 min-w-11 px-3 text-sm font-medium transition-colors'
  const on = 'bg-neutral-100 text-neutral-950'
  const off = 'bg-transparent text-neutral-300 hover:bg-neutral-800'

  return (
    <div
      role="group"
      aria-label="Temperature unit"
      className="inline-flex overflow-hidden rounded-md border border-neutral-700"
    >
      <button
        type="button"
        aria-pressed={unit === 'c'}
        onClick={() => setUnit('c')}
        className={`${base} ${unit === 'c' ? on : off}`}
      >
        °C
      </button>
      <button
        type="button"
        aria-pressed={unit === 'f'}
        onClick={() => setUnit('f')}
        className={`${base} ${unit === 'f' ? on : off}`}
      >
        °F
      </button>
    </div>
  )
}