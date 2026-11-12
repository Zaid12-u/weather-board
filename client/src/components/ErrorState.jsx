/**
 * @param {{
 *   type?: 'network' | 'api',
 *   onRetry?: () => void,
 * }} props
 */
export default function ErrorState({ type = 'api', onRetry }) {
  const message =
    type === 'network'
      ? 'You appear to be offline. Check your connection and retry.'
      : 'The weather service is not responding right now. Try again in a moment.'

  return (
    <div
      role="alert"
      className="w-full rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-5"
    >
      <p className="text-sm text-neutral-300 sm:text-base">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md border border-neutral-600 bg-neutral-800 px-4 text-sm text-neutral-100 hover:bg-neutral-700"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}
