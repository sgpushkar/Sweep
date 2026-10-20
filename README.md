# Sweep — APK download site

React + Vite static site. No backend, no database.

## Run
    npm install
    npm run dev        # local dev
    npm run build      # outputs dist/
    npm run preview    # serve the production build

## Publish a release (no rebuild needed)
Edit `dist/release.json` (or `public/release.json` before building):

    {
      "version": "1.0.0",
      "apkUrl": "https://your-host/Sweep-1.0.0.apk",
      "size": "8.4 MB",
      "date": "2026-11-01",
      "minAndroid": "Android 8.0",
      "sha256": "<64 hex chars>",
      "notes": ["Initial release"],
      "repoUrl": "https://github.com/you/repo",
      "support": "mailto:you@example.com",
      "privacyUrl": "https://your-site/privacy"
    }

Rules: `apkUrl` must be https. Empty `apkUrl` shows "Build not yet published" and disables the button.
Fields left `null` display "Not provided". Invalid JSON or a non-https URL shows an error state.
Defaults also live in `src/release.js` (used if `release.json` is missing). Rename the product there too.

Host the APK itself anywhere that serves it directly (GitHub Releases, your own storage).

## Deploy
Upload `dist/` to any static host.
- Netlify: build `npm run build`, publish `dist` (`_redirects` + `404.html` included).
- Vercel / Cloudflare Pages: framework Vite, output `dist`.
- GitHub Pages: works at sub-paths (`base: './'`); `404.html` is served automatically.

Navigation uses hash anchors, so no server rewrite rules are required.
Before launch: add real Privacy Policy and support values, and optionally an `og:image`.
