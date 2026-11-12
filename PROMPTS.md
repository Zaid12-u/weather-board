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