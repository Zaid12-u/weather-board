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

registerRoute(
  ({ url }) => url.origin === 'https://geocoding-api.open-meteo.com',
  new NetworkOnly(),
)

// Push / notification handlers will be added in a later step:
// self.addEventListener('push', (event) => { ... })
// self.addEventListener('notificationclick', (event) => { ... })
