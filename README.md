# Sweep — WhatsApp Media Cleaner

> **Clean up WhatsApp media clutter with a swipe.**

Sweep is a two-part project: a **React Native Android app** that lets you swipe through your WhatsApp images and videos to decide what to delete, and a **static React/Vite download site** that serves the APK and release info.

---

## What it does

WhatsApp accumulates gigabytes of forwarded memes, blurry photos, and duplicate videos over time. Sweep gives you a fast, card-by-card review flow — swipe left to mark for deletion, swipe right to keep — and then deletes everything in one authorized batch so Android's MediaStore stays consistent.

### Key features
- **Real MediaStore discovery** — reads actual WhatsApp images & videos via Android's media APIs, no root required
- **Swipe-to-review cards** — one file at a time, left to delete / right to keep
- **Full undo stack** — change your mind before confirming
- **Batch safe deletion** — uses `MediaStore.createDeleteRequest()`, Android's system-authorized delete dialog
- **Storage insights** — largest files, duplicate candidates, total space recoverable
- **In-app update screen** — fetches `release.json` from this repo and shows the latest APK with SHA-256 verification

---

## Repo structure

```
sweep/
├── src/               # React + Vite static download site
│   ├── components/    # Hero, DlBtn, Sections, Swipe demo, Art
│   ├── release.js     # Single source of truth for release metadata
│   ├── data.js        # FAQ and demo card data
│   └── styles.css     # All site styles
├── public/
│   ├── release.json   # Served at runtime; overrides release.js if present
│   └── releases/      # APK binaries (hosted separately / GitHub Releases)
├── android-app/       # React Native Android source
│   ├── src/
│   │   ├── screens/   # Home, Review, Queue, Storage, Settings, Update
│   │   ├── services/  # mediaDiscovery, deletionManager, duplicateService, updateService
│   │   ├── components/# UI: SwipeCard, ReviewControls, StorageBar, etc.
│   │   ├── storage/   # settingsStore, sessionStore (AsyncStorage)
│   │   └── types/     # TypeScript types for media, settings, updates
│   └── android/       # Native Android project (Kotlin + Gradle)
├── index.html
├── vite.config.js
└── package.json
```

---

## Tech stack

| Layer | Stack |
|---|---|
| Download site | React 18, Vite 5, vanilla CSS |
| Android app | React Native, TypeScript, AsyncStorage |
| Native module | Kotlin — `WhatsAppMediaCleanerModule` |
| Media API | Android `MediaStore`, `createDeleteRequest` |
| Hosting | Vercel / Netlify / GitHub Pages (static) |

---

## Run the site locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
npm run preview    # serve the production build
```

## Publishing a release

Edit `public/release.json` (or `src/release.js` before building):

```json
{
  "version": "1.0.0",
  "apkUrl": "https://your-host/Sweep-1.0.0.apk",
  "size": "113.7 MB",
  "date": "2026-10-13",
  "minAndroid": "Android 8.0 (API 26)",
  "sha256": "<64 hex chars>",
  "notes": ["What changed in this release"],
  "repoUrl": "https://github.com/sgpushkar/Sweep",
  "support": "mailto:you@example.com",
  "privacyUrl": "https://your-site/privacy"
}
```

> `apkUrl` must be `https://` or a root-relative path. Empty → "Build not yet published". Invalid URL or bad JSON → error state.

## Deploy

Upload `dist/` to any static host:
- **Netlify** — build `npm run build`, publish `dist` (`_redirects` + `404.html` included)
- **Vercel / Cloudflare Pages** — framework: Vite, output: `dist`
- **GitHub Pages** — works at sub-paths (`base: './'`); `404.html` served automatically

Navigation uses hash anchors — no server rewrite rules needed.

## Verify the APK

```bash
# Linux / macOS
sha256sum WhatsAppMediaCleaner.apk

# Windows PowerShell
Get-FileHash WhatsAppMediaCleaner.apk
```

Compare the output against the SHA-256 shown on the download page.

---

## Permissions

The app requests these Android permissions:

| Permission | Why |
|---|---|
| `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO` | List WhatsApp media files |
| `WRITE_EXTERNAL_STORAGE` (API ≤ 28) | Legacy delete on older Android |
| `INTERNET` | Fetch `release.json` for in-app update check |

Deletion goes through Android's system dialog — the app never silently removes files.

---

## License

MIT — do whatever you want, just don't pretend you wrote the whole thing.
