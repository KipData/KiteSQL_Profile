# KiteSQL GitHub Profile Demo

A lightweight Vite site that showcases KiteSQL running fully in the browser via WebAssembly. Use it for GitHub Pages or any static host, then embed a link in your profile README.

## Setup

1) Install deps (pulls the published `kite_sql` npm package):
```bash
npm install
```
2) Run locally:
```bash
npm run dev
```
> The app uses a small browser-friendly wrapper (`src/kite-sql-web.ts`) to load the npm-shipped `kite_sql_bg.wasm` with Vite’s `?url` asset handling. No local Rust build is needed.

## Scripts
- `npm run dev` — start Vite dev server.
- `npm run build` — produce static assets in `dist/` (ready for GitHub Pages).
- `npm run preview` — preview the production build.

## Deploy to GitHub Pages
- Push this folder as a separate repo or a `gh-pages` branch, then serve `dist/`.
- In your GitHub profile README, link to the deployed page and add a badge/screenshot.

## How it works
- Uses the published `kite_sql` wasm asset from npm with a small browser loader.
- Runs a small SQL script (create/insert/update/select) entirely in the browser, then renders the result table.
