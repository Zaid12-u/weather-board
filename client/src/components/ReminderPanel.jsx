import { useState } from 'react'

/**
 * @param {{
 *  supported: boolean,
 *  permission: 'default' | 'granted' | 'denied' | 'unsupported',
 *  settings: { enabled: boolean, time: string },
 *  update: (patch: object) => void,
 *  requestPermission: () => Promise<string>,
 * }} props
 */
export default function ReminderPanel({
  supported,
  permission,
  settings,
  update,
  requestPermission,
}) {
  const [timeError, setTimeError] = useState('')
  const [busy, setBusy] = useState(false)

  function validateTime(value) {
    if (!value) {
      setTimeError('Pick a reminder time, for example 08:00.')
      return false
    }
    setTimeError('')
    return true
  }

  async function handleEnable() {
    if (!validateTime(settings.time)) return
    setBusy(true)
    const result = await requestPermission()
    setBusy(false)
    if (result === 'granted') update({ enabled: true })
  }

  function handleToggle() {
    if (!settings.enabled && !validateTime(settings.time)) return
    update({ enabled: !settings.enabled })
  }

  return (
    <section
      aria-labelledby="reminder-heading"
      className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4"
    >
      <h2 id="reminder-heading" className="text-sm font-semibold text-neutral-50">
        Daily weather reminder
      </h2>

      {!supported || permission === 'unsupported' ? (
        <p className="mt-2 text-sm text-neutral-400">
          This browser does not support notifications, so reminders are
          unavailable. Everything else in WeatherBoard works normally. For
          reminders, try Chrome or Edge.
        </p>
      ) : (
        <>
          {permission === 'default' ? (
            <p className="mt-2 text-sm text-neutral-400">
              We will ask your browser for permission to send one notification
              a day at the time you choose, so you can check the weather each
              morning. We never send anything else. You can turn it off any
              time.
            </p>
          ) : null}

          {permission === 'denied' ? (
            <p className="mt-2 text-sm text-amber-200">
              Notifications are blocked for this site. To get reminders,
              allow notifications from the lock icon in the address bar, then
              reload. The rest of the app is not affected.
            </p>
          ) : null}

          {permission !== 'denied' ? (
            <div className="mt-3">
              <label
                htmlFor="reminder-time"
                className="block text-sm text-neutral-300"
              >
                Reminder time
              </label>
              <input
                id="reminder-time"
                type="time"
                value={settings.time}
                onChange={(e) => {
                  update({ time: e.target.value })
                  if (timeError) validateTime(e.target.value)
                }}
                onBlur={(e) => validateTime(e.target.value)}
                aria-invalid={Boolean(timeError)}
                aria-describedby={timeError ? 'reminder-time-error' : undefined}
                className="mt-1 h-11 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 text-neutral-100 sm:w-40"
              />
              {timeError ? (
                <p
                  id="reminder-time-error"
                  role="alert"
                  className="mt-1 text-sm text-red-400"
                >
                  {timeError}
                </p>
              ) : null}
            </div>
          ) : null}

          {permission === 'default' ? (
            <button
              type="button"
              onClick={handleEnable}
              disabled={busy}
              className="mt-3 min-h-11 w-full rounded-md bg-neutral-100 px-4 text-sm font-medium text-neutral-950 disabled:opacity-60 sm:w-auto"
            >
              {busy ? 'Waiting for your choice...' : 'Enable daily reminder'}
            </button>
          ) : null}

          {permission === 'granted' ? (
            <button
              type="button"
              role="switch"
              aria-checked={settings.enabled}
              onClick={handleToggle}
              className="mt-3 min-h-11 w-full rounded-md border border-neutral-700 px-4 text-sm text-neutral-100 sm:w-auto"
            >
              {settings.enabled
                ? `Reminder on, ${settings.time}. Tap to turn off`
                : 'Reminder off. Tap to turn on'}
            </button>
          ) : null}
        </>
      )}
    </section>
  )
}