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