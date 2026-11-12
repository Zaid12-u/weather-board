/**
 * Fixed offline banner. Does not shift page layout.
 * @param {{ visible: boolean }} props
 */
export default function OfflineBanner({ visible }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <p className="rounded-md border border-amber-800/80 bg-neutral-950/95 px-3 py-2 text-center text-xs text-amber-100 shadow-lg sm:text-sm">
        You&apos;re offline. Showing the last saved city.
      </p>
    </div>
  )
}
