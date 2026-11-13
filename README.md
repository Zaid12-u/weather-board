# WeatherBoard

A responsive, installable weather dashboard built with React. Search any city, see current conditions and a 5-day forecast, save favourite cities, use it offline, and get a daily weather reminder.



## Features

- City search with live autocomplete (300 ms debounce, loading, no-results and error states)
- Current weather (temperature, feels like, humidity, wind, condition icon) and a 5-day forecast from real API data
- Inline form validation on blur, with specific messages for empty input, no results, and network or API failure
- Up to 5 favourite cities saved in localStorage, with a confirmation dialog before removal and a graceful fallback if storage is unavailable
- Installable PWA with a web manifest, service worker, app-shell caching, and an offline banner
- Offline mode that shows the last viewed city's weather
- Daily weather reminder notification with a user-chosen time and an explanation shown before the permission prompt
- Responsive layout tested at 375, 768 and 1280 px, with no horizontal scroll and touch targets of at least 44 px
- Bonus: dark/light theme (follows the system preference, then remembers the user's choice) and a °C/°F toggle that updates instantly and persists

## Tech stack

- React 19 + Vite (JavaScript)
- Tailwind CSS v4
- vite-plugin-pwa (injectManifest) + Workbox
- lucide-react icons
- Deployed on Vercel

## Setup

```bash
git clone https://github.com/Zaid12-u/weather-board.git
cd weather-board/client
npm install
npm run dev
```

To test the PWA features (service worker, offline mode, install), use a production build:

```bash
npm run build
npm run preview
```

No API keys or environment variables are required.

## APIs used

| API | Purpose | Key |
| --- | --- | --- |
| Open-Meteo Forecast | Current conditions and 5-day forecast | No |
| Open-Meteo Geocoding | City autocomplete | No |
| Notifications API + Service Worker | Daily reminder | No |

## Architecture decisions

- **Service layer:** all network calls live in `src/services/`. `geocoding.js` is the only file that knows which geocoding provider is used, so it can be swapped for GeoDB by changing one file.
- **Typed errors:** services throw `{ type: "network" }` or `{ type: "api" }`, and the UI shows a specific message and a Retry action for each.
- **Race conditions:** `AbortController` cancels stale requests when the city changes or the user keeps typing.
- **Hooks for state:** `useWeather`, `useFavourites`, `useReminder`, `useTheme`, and `useOnlineStatus` keep components small and testable.
- **Offline strategy:** the service worker precaches the app shell and serves the weather API with NetworkFirst, keeping only one entry (the last viewed city). The app also saves the last weather response in localStorage and shows it with an "Offline" notice when the network fails.
- **Units:** data is always stored in Celsius and converted only for display, so switching units never needs a refetch.
- **Theming:** the Tailwind neutral palette is remapped with CSS variables under `data-theme="light"`, so one palette drives both themes.
- **Reminder settings in the service worker:** a service worker cannot read localStorage, so reminder settings are sent to it with `postMessage` and kept in the Cache API.
- **Safe storage:** every localStorage access goes through try/catch helpers in `src/utils/storage.js`.

## Project structure

```
client/src
  components/   UI components (search, weather, forecast, favourites, reminder, toggles)
  hooks/        state and behaviour hooks
  services/     API calls (geocoding, weather)
  context/      unit (C/F) context
  utils/        storage, units, weather code mapping
  sw.js         service worker (caching, notifications)
```

## Known limitations

- **Autocomplete provider:** the brief suggests GeoDB Cities. The RapidAPI signup was not accessible while building, so Open-Meteo Geocoding is used instead. The service layer is isolated so GeoDB can be added by editing `geocoding.js`.
- **Weather provider:** only Open-Meteo is used. There is no OpenWeatherMap fallback.
- **Reminders when the tab is closed:** a reliable background push needs a server to send Web Push messages, and this project is client-side only. Reminders use Periodic Background Sync inside the service worker, which only works on Chromium browsers (Chrome, Edge) with the app installed as a PWA, and the browser decides when it actually runs. Elsewhere, the reminder is checked while the app is open. The notification code handles a real `push` event, so a backend could be added later without changing the client.
- **Offline scope:** only the last viewed city's weather is available offline, and city search needs a connection.
- **Weather icons** are static icons, not animated.

## Prompt history

See [PROMPTS.md](./PROMPTS.md) for the agent prompt history and the IDE used.