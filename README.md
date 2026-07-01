# ICT Adaptive Bot Pro

A production-ready, **offline**, **local-only** trading journal app for ICT-style traders.
Black & gold, dark-mode-only, professional dashboard design. No login, no PIN/biometric lock,
no cloud dependency, no paid APIs.

Built with **React Native + Expo** (SDK 51) so it can be compiled into a free, installable
Android APK using **GitHub Actions** — no Mac, no Android Studio, and no paid Expo/EAS account
required.

---

## What's inside

| Feature | Details |
|---|---|
| Dashboard | Total trades, wins/losses, win rate, net P/L, profit factor, avg RR, avg quality score, best/worst pair, best session, best setup, streaks, weekly/monthly profit, equity curve |
| Trade Journal | Full CRUD, search, filter by result, screenshot thumbnails |
| Add/Edit Trade | All requested fields incl. auto-calculated RR from entry/SL/TP, screenshot attachment, notes |
| Pre-Trade Checklist | Separate Long/Short confluence checklists, RR ≥ 1:3 and Quality Score ≥ 85 gates, live "NO TRADE" / "TRADE VALID" verdict, Friday 18:00 cutoff warning, standing trading rules reference |
| Analytics | Setup / session / pair performance tables, monthly report, calendar heatmap of daily P/L |
| AI Coach | 100% local, rule-based feedback engine (no API calls, no internet needed) — runs after every saved trade |
| Export/Backup | CSV export (Excel-compatible), PDF performance report, full JSON backup + restore |
| Settings | Starting balance, risk-automation toggles, rules reference, factory reset |
| Storage | 100% on-device via AsyncStorage — no login, no account, no server |
| Security | Deliberately **no** PIN, fingerprint, or biometric lock, per spec |

---

## Project structure

```
ict-adaptive-bot-pro/
├── App.js
├── app.json
├── babel.config.js
├── package.json
├── eas.json                     (optional — only if you want cloud EAS builds instead)
├── assets/
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash.png
│   └── favicon.png
├── .github/workflows/build-apk.yml   ← builds the APK automatically
└── src/
    ├── theme/colors.js
    ├── context/TradeContext.js
    ├── navigation/AppNavigator.js
    ├── utils/
    │   ├── constants.js
    │   ├── calculations.js
    │   ├── aiCoach.js
    │   ├── storage.js
    │   ├── exportUtils.js
    │   └── id.js
    ├── components/
    │   ├── StatCard.js
    │   ├── Section.js
    │   ├── ScoreBadge.js
    │   ├── TradeListItem.js
    │   ├── ChecklistItem.js
    │   ├── FormField.js
    │   ├── EquityCurveChart.js
    │   └── CalendarHeatmap.js
    └── screens/
        ├── DashboardScreen.js
        ├── JournalScreen.js
        ├── AddEditTradeScreen.js
        ├── ChecklistScreen.js
        ├── AnalyticsScreen.js
        ├── ExportScreen.js
        └── SettingsScreen.js
```

---

## How the APK gets built (technical summary)

The GitHub Actions workflow at `.github/workflows/build-apk.yml`:

1. Checks out your repo.
2. Installs Node.js 20 and Java 17 (Android builds need Java).
3. Runs `npm install`.
4. Runs `npx expo prebuild --platform android` — this **generates a real native
   Android Studio project** from the Expo app (the `android/` folder), with zero
   Expo account or login required.
5. Runs `./gradlew assembleDebug` (installable immediately) and `assembleRelease`
   (a smaller, optimized build). The release APK comes out of Gradle *unsigned*,
   so the workflow also generates a one-off signing key with `keytool` and signs
   it with `zipalign` + `apksigner` — both already present on GitHub's runners.
   You don't create or manage any keystore yourself.
6. Uploads the APK as a downloadable build artifact.

This is the most **reliable free option**: it doesn't depend on Expo's EAS cloud
queue (which has usage limits) and doesn't require Xcode/Android Studio on your
own machine. Everything happens on GitHub's free Ubuntu runners.

> The debug APK (`app-debug.apk`) is immediately installable on any Android phone —
> Android's debug signing works out of the box, no keystore setup needed.

---

## Step 1 — Upload this project to GitHub

1. Create a free GitHub account at https://github.com if you don't have one.
2. Click **New repository** (top right → "+" → "New repository").
3. Name it, e.g., `ict-adaptive-bot-pro`. Keep it **Public** or **Private** — either works.
   Do **not** initialize with a README (you already have one).
4. On your computer, open a terminal in this project folder and run:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: ICT Adaptive Bot Pro"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ict-adaptive-bot-pro.git
   git push -u origin main
   ```

   (Replace `YOUR_USERNAME` with your GitHub username.)

   **No local Node/npm needed for this step** — you're just uploading files. If you
   prefer, you can instead use GitHub's web UI: create the repo, then drag-and-drop
   the entire project folder onto the "Upload files" page.

---

## Step 2 — Run GitHub Actions to build the APK

1. Go to your repository on GitHub.
2. Click the **Actions** tab.
3. You should see a workflow called **"Build Android APK"**.
   - It runs automatically on every push to `main`.
   - To trigger it manually: click **Build Android APK** → **Run workflow** →
     **Run workflow** (green button).
4. Click into the running workflow and watch the steps execute (takes roughly
   5–10 minutes).
5. Wait for the green checkmark ✅ meaning the build succeeded.

---

## Step 3 — Download the APK

1. Still inside that workflow run, scroll down to the **Artifacts** section.
2. You'll see two APKs — either one installs and runs fine:
   - `ICT-Adaptive-Bot-Pro-debug-apk` — Android's built-in debug signing, always works.
   - `ICT-Adaptive-Bot-Pro-release-signed-apk` — a smaller, optimized release build,
     automatically signed in CI with a freshly generated key (no keystore setup
     needed on your end). This is the one to use day-to-day.
3. Click either artifact to download a `.zip`.
4. Unzip it — inside is the `.apk` file (`app-debug.apk` or `app-release-signed.apk`).
5. Transfer that `.apk` file to your Android phone (email it to yourself, use
   Google Drive, a USB cable, or Bluetooth — any method works).

---

## Step 4 — Install the APK on your Android phone

1. On your phone, tap the downloaded `app-debug.apk` file (in Downloads, Drive, etc.).
2. Android will warn that installing apps from outside the Play Store is blocked by
   default. Tap **Settings** in that prompt, then enable **"Allow from this source"**
   (wording varies by Android version/manufacturer — usually under
   *Settings → Apps → Special access → Install unknown apps*).
3. Go back and tap the APK again, then tap **Install**.
4. Once installed, open **ICT Adaptive Bot Pro** from your app drawer.

That's it — the app runs fully offline, stores everything locally, and needs no
login, PIN, or fingerprint.

---

## Alternative: build locally with Android Studio (optional)

If you'd rather build on your own machine instead of GitHub Actions:

```bash
npm install
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
```

The APK will appear at `android/app/build/outputs/apk/debug/app-debug.apk`.
You'll need Node.js 18+, a JDK (17 recommended), and the Android SDK installed
(Android Studio installs all of this for you automatically).

## Alternative: build with EAS (Expo's cloud build service)

An `eas.json` is included if you'd prefer Expo's own free-tier cloud build instead
of GitHub Actions:

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

This requires a free Expo account and is subject to Expo's free-tier build queue,
which is why GitHub Actions (Step 1–4 above) is the primary recommended path.

---

## Customizing

- **Colors / theme**: edit `src/theme/colors.js`.
- **Checklist rules, setup types, sessions**: edit `src/utils/constants.js`.
- **AI Coach logic**: edit `src/utils/aiCoach.js` — it's pure JavaScript,
  fully offline, easy to extend with new rules.
- **App name/icon/package id**: edit `app.json` (`expo.name`,
  `expo.android.package`, and the files in `assets/`).

## Notes on "Excel-compatible" export

The CSV export opens natively in Microsoft Excel, Google Sheets, and Numbers —
CSV is the universally compatible spreadsheet interchange format. If you need a
native `.xlsx` binary file specifically, you can add the `xlsx` (SheetJS) npm
package and swap it into `src/utils/exportUtils.js`; this was kept as CSV by
default to keep the dependency list minimal and the CI build reliable.

## Troubleshooting the build

- If `npx expo prebuild` fails in Actions with a dependency version warning, run
  `npx expo install --fix` locally, commit the updated `package.json`, and push
  again — this snaps all Expo module versions to the exact set SDK 51 expects.
- If Gradle fails with an out-of-memory error, it's usually transient on the free
  GitHub runner — just re-run the workflow (Actions tab → failed run → **Re-run
  all jobs**).
