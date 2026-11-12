/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { NetworkFirst, NetworkOnly } from 'workbox-strategies'

self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)

const navigationHandler = createHandlerBoundToURL('/index.html')
registerRoute(new NavigationRoute(navigationHandler))

// Weather API: only the last viewed city is kept
registerRoute(
  ({ url }) => url.origin === 'https://api.open-meteo.com',
  new NetworkFirst({
    networkTimeoutSeconds: 5,
    cacheName: 'weather-api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1,
      }),
    ],
  }),
)

// City search: never cached
registerRoute(
  ({ url }) => url.origin === 'https://geocoding-api.open-meteo.com',
  new NetworkOnly(),
)

// ---------- Daily reminder ----------
const SETTINGS_CACHE = 'weatherboard-settings'
const SETTINGS_URL = '/__reminder-settings.json'

async function saveSettings(settings) {
  const cache = await caches.open(SETTINGS_CACHE)
  await cache.put(
    SETTINGS_URL,
    new Response(JSON.stringify(settings), {
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

async function loadSettings() {
  const cache = await caches.open(SETTINGS_CACHE)
  const res = await cache.match(SETTINGS_URL)
  return res ? res.json() : null
}

function describe(code) {
  if (code === 0) return 'Clear sky'
  if (code <= 3) return 'Partly cloudy'
  if (code <= 48) return 'Foggy'
  if (code <= 67) return 'Rain'
  if (code <= 77) return 'Snow'
  if (code <= 82) return 'Rain showers'
  return 'Thunderstorm'
}

async function showWeatherNotification(settings) {
  const city = settings?.city
  let title = 'WeatherBoard'
  let body = "Open WeatherBoard to check today's weather."

  if (city) {
    try {
      const url =
        'https://api.open-meteo.com/v1/forecast' +
        `?latitude=${city.latitude}&longitude=${city.longitude}` +
        '&current=temperature_2m,weather_code' +
        '&daily=temperature_2m_max,temperature_2m_min' +
        '&forecast_days=1&timezone=auto'
      const res = await fetch(url)
      if (!res.ok) throw new Error('bad response')
      const data = await res.json()
      title = `Good morning! Weather in ${city.name}`
      body =
        `${describe(data.current.weather_code)}, ` +
        `${Math.round(data.current.temperature_2m)}°C now. ` +
        `High ${Math.round(data.daily.temperature_2m_max[0])}° / ` +
        `Low ${Math.round(data.daily.temperature_2m_min[0])}°.`
    } catch {
      // offline or API down: keep the generic message
    }
  }

  await self.registration.showNotification(title, {
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'daily-weather',
  })
}

// Shows the notification once per day, only after the chosen time
async function maybeNotify() {
  const settings = await loadSettings()
  if (!settings || !settings.enabled) return

  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const [h, m] = (settings.time || '08:00').split(':').map(Number)
  const due =
    now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)

  if (due && settings.lastNotified !== today) {
    await showWeatherNotification(settings)
    await saveSettings({ ...settings, lastNotified: today })
  }
}

// Background check (installed PWA on Chromium browsers only)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-weather') event.waitUntil(maybeNotify())
})

// Messages from the app
self.addEventListener('message', (event) => {
  const msg = event.data
  if (!msg) return

  if (msg.type === 'SET_REMINDER') {
    event.waitUntil(
      loadSettings().then((old) => {
        const sameTime = old && old.time === msg.settings.time
        return saveSettings({
          ...msg.settings,
          lastNotified: sameTime ? old.lastNotified : null,
        })
      }),
    )
  }

  if (msg.type === 'CHECK_NOW') event.waitUntil(maybeNotify())

  if (msg.type === 'TEST_NOTIFICATION') {
    event.waitUntil(showWeatherNotification(msg.settings))
  }
})

// Real server push (needs a backend, so only a safe fallback here)
self.addEventListener('push', (event) => {
  const text = event.data ? event.data.text() : "Check today's weather."
  event.waitUntil(
    self.registration.showNotification('WeatherBoard', {
      body: text,
      icon: '/pwa-192x192.png',
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if ('focus' in client) return client.focus()
        }
        return self.clients.openWindow('/')
      }),
  )
})