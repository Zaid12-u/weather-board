export default function WeatherSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-4">
        <div className="h-7 w-2/3 max-w-md rounded-md bg-neutral-800" />
        <div className="flex flex-wrap items-end gap-4">
          <div className="h-14 w-28 rounded-md bg-neutral-800 sm:h-16" />
          <div className="h-11 w-40 rounded-md bg-neutral-800" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="h-11 rounded-md bg-neutral-800" />
          <div className="h-11 rounded-md bg-neutral-800" />
          <div className="h-11 rounded-md bg-neutral-800" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-6 w-40 rounded-md bg-neutral-800" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="min-h-[7.5rem] rounded-lg border border-neutral-800 bg-neutral-900/60 p-3"
            >
              <div className="h-4 w-12 rounded bg-neutral-800" />
              <div className="mt-3 size-6 rounded bg-neutral-800" />
              <div className="mt-3 h-4 w-16 rounded bg-neutral-800" />
              <div className="mt-4 h-4 w-14 rounded bg-neutral-800" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading weather…</span>
    </div>
  )
}
