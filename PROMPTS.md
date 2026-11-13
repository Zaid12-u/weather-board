# PROMPTS.md
IDE used: Cursor (Hobby/free plan)

Project: WeatherBoard, a React (Vite, JavaScript) weather dashboard PWA. The app lives in /client. App.jsx and index.css are intentionally empty. Do ONLY this setup step, nothing else:

1. Install and configure Tailwind CSS v4 using the @tailwindcss/vite plugin (add it to vite.config.js and put @import "tailwindcss"; in src/index.css).
2. Create these empty folders in src: components, hooks, services, utils, context.
3. Create client/.env.example with:
   VITE_RAPIDAPI_KEY=
   VITE_GEODB_HOST=wft-geo-db.p.rapidapi.com
   and make sure .env is listed in .gitignore.
4. Write a minimal App.jsx shell: a header with the text "WeatherBoard" and a centered main container (max-w-6xl, mobile-first padding). Use a calm dark neutral Tailwind palette. No horizontal scroll at any width. No other features yet.
5. In index.html set the title to "WeatherBoard", add a proper viewport meta tag and a theme-color meta tag.

Do not add any libraries other than Tailwind. When done, run npm run dev and confirm there are no errors.

Prompt #2
Context: WeatherBoard, React (Vite, JS) + Tailwind v4 in /client. Implement ONLY city search with autocomplete. No weather fetching yet.

1. src/services/geocoding.js
   - export async function searchCities(query, signal) using https://geocoding-api.open-meteo.com/v1/search?name={query}&count=6&language=en&format=json
   - Return a normalized array: { id, name, admin1, country, countryCode, latitude, longitude, timezone }
   - Return [] when the API returns no "results" key.
   - Throw a typed error: { type: "network" } if fetch fails/offline, { type: "api" } if response is not ok. Keep this file the only place that knows the geocoding provider, so it can be swapped for GeoDB later.

2. src/hooks/useDebounce.js: standard debounced value hook.

3. src/components/CitySearch.jsx
   - Controlled input + dropdown of suggestions. Debounce 300ms, minimum 2 characters.
   - Use AbortController to cancel stale requests.
   - States shown visibly inside the dropdown: loading (spinner/skeleton), results, no results ("No cities found for 'xyz'. Check the spelling or try a nearby city."), network error ("You appear to be offline. Check your connection and try again."), API error ("The city search service is not responding. Try again in a moment.") with a Retry button.
   - Validation: on blur, if the field is empty show inline error "Enter a city name to search." Also show an inline error if the user typed text but never picked a suggestion. Use aria-invalid and aria-describedby.
   - Accessibility: role="combobox", listbox/option roles, keyboard support (ArrowUp/Down, Enter to select, Escape to close).
   - Each suggestion shows "City, Region, Country". Touch targets minimum 44px height.
   - Props: onSelect(city). Close dropdown on outside click.

4. In App.jsx render CitySearch under the header, and below it show the selected city as simple text (name, country, lat/lon) as a temporary placeholder.

Style with Tailwind, dark neutral palette, mobile-first, no horizontal scroll. Do not add new libraries. Run the dev server and fix any errors.

Prompt # 3
Context: WeatherBoard, React (Vite, JS) + Tailwind v4 in /client. CitySearch already works and App.jsx has the selected city (name, admin1, country, latitude, longitude, timezone). Implement ONLY real weather fetching and display. No favourites, PWA or notifications yet.

1. src/services/weather.js
   - export async function getWeather({ latitude, longitude }, signal) calling https://api.open-meteo.com/v1/forecast with:
     current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,is_day
     daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max
     forecast_days=5, timezone=auto
   - Return a normalized object: { current: { temp, feelsLike, humidity, windSpeed, code, isDay, time }, daily: [{ date, code, max, min, rainChance }], units }.
   - Throw typed errors: { type: "network" } if fetch fails, { type: "api" } if response is not ok.

2. src/utils/weatherCodes.js
   - Map WMO weather codes to { label, icon } (clear, partly cloudy, fog, drizzle, rain, snow, thunderstorm, etc.), with day/night variants for clear/partly cloudy. Use lucide-react icons (install lucide-react, the only new library allowed).

3. src/hooks/useWeather.js
   - useWeather(city): returns { data, loading, error, refetch }. Use AbortController to cancel stale requests and avoid race conditions when the city changes quickly.

4. Components in src/components:
   - CurrentWeather.jsx: city name + region + country, big temperature, condition label + icon, feels like, humidity, wind speed (km/h).
   - Forecast.jsx: 5 day cards (weekday, icon, max/min, rain chance). Horizontal grid that wraps correctly: 2 columns on mobile, 5 on desktop. No horizontal scroll.
   - WeatherSkeleton.jsx: loading skeleton matching the layout.
   - ErrorState.jsx: friendly messages with a Retry button. Network: "You appear to be offline. Check your connection and retry." API: "The weather service is not responding right now. Try again in a moment." Never show "Something went wrong".
   - EmptyState.jsx: shown before any city is selected, with a short helpful message ("Search for a city to see its weather").

5. App.jsx: wire it all together: CitySearch -> selected city -> useWeather -> loading / error / data / empty states. Save the last selected city to localStorage under the key "weatherboard:lastCity" (wrapped in try/catch) and restore it on load.

Keep the dark neutral palette, mobile-first, touch targets at least 44px, no horizontal scroll at 375/768/1280px. Run the dev server and fix any errors.
 
 Prompt #4
 Context: WeatherBoard, React (Vite, JS) + Tailwind v4 in /client. City search and weather display already work. Implement ONLY the favourite cities feature. No PWA or notifications yet.

1. src/utils/storage.js
   - safeGet(key, fallback), safeSet(key, value), safeRemove(key), all wrapped in try/catch.
   - export isStorageAvailable() that tests a write/remove and returns true/false.
   - Refactor the existing "weatherboard:lastCity" code in App.jsx to use these helpers.

2. src/hooks/useFavourites.js
   - Persist in localStorage under "weatherboard:favourites". Each item: { id, name, admin1, country, latitude, longitude, timezone }.
   - Max 5 favourites. Expose: favourites, addFavourite(city), removeFavourite(id), isFavourite(id), storageAvailable.
   - addFavourite returns { ok: false, reason: "limit" | "duplicate" | "storage" } on failure so the UI can explain it.
   - If localStorage is unavailable, keep favourites in memory for the session only (no crash).

3. src/components/FavouriteButton.jsx
   - A star toggle shown on the CurrentWeather card. Filled when the city is a favourite.
   - Adding: if 5 are saved, show an inline message "You can save up to 5 cities. Remove one to add another." Do not use alert().
   - Removing from here also goes through the confirm dialog.
   - aria-pressed, aria-label, 44x44px minimum touch target.

4. src/components/FavouritesPanel.jsx
   - Quick-access panel listing saved cities as cards/chips. Clicking one loads that city's weather.
   - Each item has a remove (X) button.
   - Empty state: "No favourites yet. Tap the star on a city to save it."
   - Shows a counter "3/5".
   - If storage is unavailable, show a small notice: "Favourites can't be saved on this browser, so they will be lost when you close the tab."

5. src/components/ConfirmDialog.jsx
   - Accessible modal (role="dialog", aria-modal, focus moves in and returns on close, Escape closes, click on backdrop closes).
   - Text: "Remove {city} from favourites?" with Cancel and Remove buttons. Remove removes only after confirmation.

6. Wire into App.jsx: panel placed under the search (above the weather on mobile, a side column on desktop at 1280px). No horizontal scroll at 375/768/1280px, touch targets at least 44px.

Do not add libraries. Run the dev server and fix any errors.

Prompt # 5
Context: WeatherBoard, React (Vite, JS) + Tailwind v4 in /client. Search, weather display and favourites work. Implement ONLY PWA + offline support. No push notifications yet, but structure the service worker so notifications can be added to it in the next step.

1. Install vite-plugin-pwa and workbox-precaching/workbox-routing/workbox-strategies/workbox-expiration (dev deps where applicable). Use the injectManifest strategy with a custom service worker at src/sw.js, so I can add push/notification code to the same file later. Register it via the plugin (registerType: "autoUpdate"). Enable devOptions so it can be tested.

2. Web manifest (configured in vite.config.js): name "WeatherBoard", short_name "WeatherBoard", description, start_url "/", scope "/", display "standalone", theme_color and background_color matching the dark palette, and icons 192x192 and 512x512 (plus a 512 maskable). Also add apple-touch-icon and the theme-color meta in index.html.

3. Icons: create a simple, clean SVG app icon (weather cloud/sun on dark background) at public/icon.svg and generate the PNGs (pwa-192x192.png, pwa-512x512.png, maskable-512x512.png, apple-touch-icon.png) using @vite-pwa/assets-generator as a dev dependency. Add an npm script "generate-icons".

4. src/sw.js:
   - precacheAndRoute(self.__WB_MANIFEST) for the app shell, plus a navigation fallback to index.html (NavigationRoute).
   - Runtime caching for https://api.open-meteo.com/ with NetworkFirst (networkTimeoutSeconds 5), cache name "weather-api", ExpirationPlugin maxEntries 1 so only the last viewed city's weather is kept.
   - Runtime caching for https://geocoding-api.open-meteo.com/ with NetworkOnly (do not cache search).
   - self.skipWaiting() and clientsClaim() behavior.

5. App-level offline fallback in src/hooks/useWeather.js:
   - On every successful fetch, save { cityId, data, savedAt } to localStorage "weatherboard:lastWeather" via the safe storage helpers.
   - If a fetch fails with a network error and the saved data matches the selected city, show the saved data with a visible notice "Offline: showing data saved at {time}" instead of the error state. If no saved data matches, show the normal offline error.

6. src/hooks/useOnlineStatus.js using navigator.onLine plus the online/offline window events.
   src/components/OfflineBanner.jsx: a fixed, accessible (role="status") banner at the top: "You're offline. Showing the last saved city." It appears when offline and disappears when back online, with no layout jump. When back online, automatically refetch the current city.

7. Make sure the CitySearch offline error message still works.

Do not add other libraries. Run npm run build and fix any errors or warnings.
                         ***********************************

         

## Note: agent limit reached after Prompt 5

The Cursor free-plan usage limit was hit while Prompt 5 (PWA + offline support) was running, and it stayed active until after the deadline. The agent had only partly finished that step, so I completed the rest of the project manually: the service worker and PWA configuration, the offline banner wiring, the daily reminder notifications, the °C/°F toggle, the dark/light theme, and the README. For this manual work I used Claude (a chat assistant) for code suggestions, and I reviewed and tested each step in the browser myself. Because these steps were not run through an agentic IDE, there are no agent prompts for them.



