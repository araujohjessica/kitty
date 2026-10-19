# Kitty 🐷

![CI](https://github.com/araujohjessica/kitty/actions/workflows/ci.yml/badge.svg)
![Platforms](https://img.shields.io/badge/platforms-Web%20%7C%20Android%20%7C%20iOS-8b5cf6)

**Split group expenses with friends.** A mobile app for trips, roommates and dinners: add what you paid, see who owes whom, and settle up with Pix.

🔗 **Live demo (web):** https://kitty-henna.vercel.app (tap **"Explorar com conta demo"**)
📱 **Android & iOS:** coming soon to **Google Play** and the **App Store**
🧩 **API:** [kitty-api](https://github.com/araujohjessica/kitty-api) · [Swagger docs](https://kitty-api-jn0c.onrender.com/docs)

> The API runs on a free instance, so the first request after a while may take up to a minute.

## Features

- **Groups** with invite links
- **Expenses** split equally, by exact amounts or by percentage, with a live preview of each share
- **Balances** with suggested transfers: the fewest payments needed to settle the group
- **Pix settlements:** copy-and-paste Pix key, upload a receipt, and the receiver confirms it
- **Profile** with a validated Pix key, plus light and dark themes
- **One codebase, three platforms:** installable PWA on the web, plus native Android and iOS apps

## Platforms

| Platform | Status |
|---|---|
| 🌐 Web (PWA) | ✅ Live, installable from the browser |
| 🤖 Android | ✅ Native build ready · 🚀 Google Play release coming soon |
| 🍎 iOS | ✅ Native build ready · 🚀 App Store release coming soon |

The native apps are built with **Capacitor** from the same Angular + Ionic codebase as the web version.

## Stack

| | |
|---|---|
| Framework | **Angular 22** (standalone components) + **Ionic 9** |
| Native | **Capacitor 8** (Android and iOS) |
| Offline/PWA | Angular Service Worker |
| Tests | Vitest |
| CI/CD | GitHub Actions + Vercel |

## Architecture

```
app/
├── src/app/
│   ├── core/      # API client, auth service, guard, HTTP interceptor, money helpers
│   ├── pages/     # auth, groups, group, expense form, settle, invite, join, profile
│   └── shared/    # reusable components, Pix helpers, money pipe, toasts
├── android/       # native Android project (Capacitor)
└── ios/           # native iOS project (Capacitor)
```

The money helpers mirror the API's integer-cent logic, so the split preview on the form matches exactly what the server will save.

## Testing

**22 unit tests** for money splitting, rounding, currency parsing and Pix formatting. Writing them caught a real bug: typing `12.5` was parsed as R$ 125,00 instead of R$ 12,50, now fixed and covered.

```bash
cd app
npx ng test --watch=false
```

## Running locally

Start the [API](https://github.com/araujohjessica/kitty-api) first, then:

```bash
git clone https://github.com/araujohjessica/kitty.git
cd kitty/app
npm install
npm start -- --port 8100
```

Open `http://localhost:8100`.

### Native apps

```bash
cd app
npm run build -- --configuration production
npx cap sync
npx cap open android   # Android Studio
npx cap open ios       # Xcode (macOS)
```

## Author

**Jessica Helena Araujo**, computer engineer · [GitHub](https://github.com/araujohjessica) · [LinkedIn](https://www.linkedin.com/in/jessica-araujo-89b328279/)