# WhatsApp Media Cleaner (Android App)

A premium, privacy-focused native Android utility built with React Native and TypeScript. It discovers WhatsApp images and videos on Android devices, enables fast swipe-to-clean reviews, maintains an explicit deletion queue, and safely removes media through Android's supported system authorization dialog (`MediaStore.createDeleteRequest`). It also features a built-in in-app APK download and update system with cryptographic SHA-256 integrity verification.

---

## Architecture Overview

```
android-app/
├── android/
│   ├── app/
│   │   ├── src/main/java/com/whatsappmediacleaner/
│   │   │   ├── MainActivity.kt                 # Android entry activity
│   │   │   ├── MainApplication.kt             # Application registration
│   │   │   ├── WhatsAppMediaCleanerModule.kt  # Native Kotlin module (MediaStore, SAF, Deletion, APK downloader)
│   │   │   └── WhatsAppMediaCleanerPackage.kt # ReactPackage registration
│   │   └── src/main/res/xml/file_paths.xml    # FileProvider configuration for secure APK installs
│   └── build.gradle                           # Android build configuration
├── src/
│   ├── types/
│   │   ├── media.ts                           # Media items, review decisions, permissions, scan models
│   │   ├── update.ts                          # Release manifest, download progress, checksums
│   │   └── settings.ts                        # User settings & swipe sensitivity
│   ├── theme/
│   │   ├── colors.ts                          # Obsidian dark palette: slate/black, charcoal, emerald, crimson
│   │   ├── typography.ts                      # Editorial typographic scale
│   │   └── theme.ts                           # Unified tokens
│   ├── native/
│   │   └── WhatsAppCleanerNative.ts           # Type-safe bridge to Kotlin native module
│   ├── storage/
│   │   ├── sessionStore.ts                    # Local persistence for review decisions, undo stack, scan cache
│   │   └── settingsStore.ts                   # Local persistence for preferences
│   ├── services/
│   │   ├── mediaDiscovery.ts                  # MediaStore scanning, sorting, and byte/time formatting
│   │   ├── deletionManager.ts                 # Safe deletion queue, reclaimable storage, system authorization
│   │   ├── updateService.ts                   # Manifest validation, semver comparison, download, install flow
│   │   └── duplicateService.ts                # Exact duplicate detection by byte size and media type
│   ├── components/
│   │   ├── common/                            # Header, Button, Card, Badge, ProgressBar, EmptyState
│   │   ├── review/                            # SwipeCard (PanResponder gestures), ReviewControls, EnlargedPreviewModal
│   │   ├── queue/                             # QueueItem (checkboxes), QueueSummary
│   │   └── storage/                           # StorageBar (visual segmented breakdown)
│   ├── screens/
│   │   ├── HomeScreen.tsx                     # Real stats dashboard, storage highlight, quick actions
│   │   ├── CleanScreen.tsx                    # Full-screen swipe-to-clean review experience
│   │   ├── QueueScreen.tsx                    # Deletion candidate review and Android authorization
│   │   ├── StorageScreen.tsx                  # Space insights, largest files, and duplicate detector
│   │   ├── UpdateScreen.tsx                   # Dedicated in-app APK updater and checksum verification
│   │   ├── SettingsScreen.tsx                 # Haptics, sensitivity, SAF folder picker, app permissions
│   │   └── PrivacyScreen.tsx                  # 100% offline model explainer
│   ├── navigation/
│   │   └── NavigationContext.tsx              # Hardware back button and tab/stack router
│   └── AppContainer.tsx                       # Central application state coordinator
└── __tests__/                                 # 25 automated unit tests across 6 test suites
```

---

## 1. Installing Development Dependencies

Prerequisites:
- **Node.js**: v20 or higher
- **JDK**: Java 17 or Java 21 (`JAVA_HOME` pointing to JDK directory)
- **Android SDK**: Platforms `android-35` (or `android-36`), build-tools `35.0.0` or higher
- **Android NDK**: 27.1.x

To install project dependencies:
```bash
cd android-app
npm install
```

---

## 2. Running Unit Tests

Comprehensive unit tests verify sorting, byte formatting, deletion queue integrity, release manifest validation, semver comparisons, and undo stack transitions:
```bash
npm test
```

---

## 3. Building the Debug APK

The debug APK is signed with the default Android debug keystore and is immediately installable on physical Android devices or emulators:
```powershell
cd android
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr" # or your JDK 21 path
.\gradlew :app:assembleDebug
```
The output APK is generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 4. Generating a Release Signing Key Securely

To produce a production-signed APK:

1. Generate a keystore with `keytool`:
```powershell
keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```
2. Place the generated keystore in `android/app/my-release-key.keystore` (ensure it is added to `.gitignore`).
3. Set your environment variables (never commit credentials into Git):
```powershell
$env:MYAPP_RELEASE_STORE_PASSWORD = "your-keystore-password"
$env:MYAPP_RELEASE_KEY_PASSWORD = "your-key-password"
```

---

## 5. Building a Signed Release APK

Run the release assembly task:
```powershell
cd android
.\gradlew :app:assembleRelease
```
The production APK will be created at:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 6. Testing the APK on a Physical Android Device

Connect your Android device via USB with USB Debugging enabled, then install:
```powershell
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```
Or transfer `app-debug.apk` to your device storage and open it via Android's package installer.

---

## 7. Calculating the APK's SHA-256 Checksum

In PowerShell:
```powershell
(Get-FileHash "android\app\build\outputs\apk\debug\app-debug.apk" -Algorithm SHA256).Hash
```

Example result:
`7CBECF463D42104BF3ED3C687F5ACC8824C98BC2CEA71A15C0E239E0A27A00AC`

---

## 8. In-App APK Update System & Manifest Configuration

The in-app updater fetches a JSON release manifest over HTTPS.
Example manifest schema:
```json
{
  "applicationId": "com.whatsappmediacleaner",
  "versionCode": 1,
  "versionName": "1.0.0",
  "releaseDate": "2026-10-13",
  "minSdkVersion": 26,
  "apkUrl": "https://example.com/releases/WhatsAppMediaCleaner.apk",
  "apkSizeBytes": 119288507,
  "sha256": "7cbecf463d42104bf3ed3c687f5acc8824c98bc2cea71a15c0e239e0a27a00ac",
  "releaseNotes": [
    "Initial production release of WhatsApp Media Cleaner",
    "Real Android MediaStore image and video discovery",
    "Fast swipe-to-clean review cards with full undo stack",
    "System-authorized safe deletion via MediaStore.createDeleteRequest()",
    "Storage insights, largest space consumers, and duplicate candidate analysis"
  ]
}
```

The app validates:
1. HTTPS protocol requirement (HTTP is explicitly rejected for security).
2. SemVer version comparison (`latest.versionCode > installed.versionCode`).
3. Background streaming download with real-time byte progress.
4. Cryptographic SHA-256 checksum matching before prompting installation.
5. Android `FileProvider` package installation intent (`FLAG_GRANT_READ_URI_PERMISSION`).

---

## 9. Privacy & Permissions

- **100% Offline**: Zero media files are uploaded, analyzed remotely, or transmitted over network.
- **Granular Permissions**:
  - Android 14+ (API 34+): Supports `READ_MEDIA_VISUAL_USER_SELECTED`, `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`.
  - Android 13 (API 33): `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`.
  - Android 12 and below: `READ_EXTERNAL_STORAGE`.
- **System Deletion Authorization**: On Android 11+ (API 30+), media deletion requires user approval through Android's official `MediaStore.createDeleteRequest()` dialog.
- **SAF Fallback**: If WhatsApp media is stored in a private directory not indexed by MediaStore, users can select the folder via Android's Storage Access Framework document picker.
