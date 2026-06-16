# belo-challenge

A crypto-wallet **swap simulator** built with Expo / React Native: a consolidated USD portfolio,
live CoinGecko prices, asset-to-asset swaps with instant balance updates, a notifications history,
and EN/ES localization.

Expo SDK 56 **dev build** (not Expo Go) · TypeScript (strict) · bun.

## Features

1. **Portfolio** — total USD balance + the five assets (USDT, USDC, DAI, BTC, ETH) with live price,
   24h change, 7-day sparkline, pull-to-refresh, and sort by value.
2. **Coin detail** — buy/sell price (a spread over the API mid), 24h high/low, an interactive price
   chart with 1D / 7D / 1M / 1Y ranges (scrub + haptics), your balance, and a Convert shortcut.
3. **Swap** — any pair at live prices; validates sufficient funds and a 1 USD minimum; balances
   update immediately after a successful swap.
4. **Notifications** — a toast when a swap completes + a persisted history (bell on Portfolio, with
   an unread badge).
5. **Localization** — English and Spanish, following the device language (overridable in Settings).

Extras: amount-privacy toggle, light/dark/system theme, reset portfolio, a Mock Mode switch, and a
Convert deep-link (`/swap?from=<id>`).

## Stack

| Area    | Choice                                                                       |
| ------- | ---------------------------------------------------------------------------- |
| UI      | Expo Router · NativeWind · Reanimated · react-native-svg · wagmi-charts      |
| State   | Zustand (client, persisted to MMKV) · TanStack Query (server)                |
| Data    | CoinGecko REST via axios, behind a swappable `PriceRepository` (live ⇄ mock) |
| Money   | big.js (no float math on balances)                                           |
| i18n    | i18next + expo-localization                                                  |
| Quality | Jest + React Native Testing Library · ESLint · Prettier · TypeScript         |

## Run locally

Needs [bun](https://bun.sh) and a native toolchain — Xcode (iOS) and/or Android Studio. It's a dev
build, so it does **not** run in Expo Go.

```bash
bun install

# optional — live prices. Without a key, Mock Mode (bundled fixtures) is used.
echo 'EXPO_PUBLIC_COINGECKO_API_KEY=<your-coingecko-demo-key>' > .env

bun run ios       # build the iOS dev client + start Metro
bun run android   # build the Android dev client + start Metro
bun run start     # just start Metro (when the dev client is already installed)
```

Checks: `bun run typecheck` · `bun run lint` · `bun run test` · `bun run format`.

## Build (Android & iOS)

The native `ios/` and `android/` projects are committed, so there are two paths:

- **Local:** `bun run ios` / `bun run android` (`expo run:*`). If the native folders drift from
  config, regenerate them with `bunx expo prebuild`.
- **Cloud (EAS):** profiles live in `eas.json` — `preview` (APK) and `production`.

  ```bash
  bunx eas-cli build -p android --profile preview      # installable APK
  bunx eas-cli build -p android --profile production   # Play Store AAB
  bunx eas-cli build -p ios --profile production       # needs an Apple Developer account
  ```

App id: `com.ezeed.belochallenge` (both platforms).

## Project structure

```
src/
  app/          # routes only (Expo Router): (tabs), coin/[id], notifications, asset-picker
  components/   # shared UI; components/ui = design-system primitives
  lib/          # infrastructure: api, errors, query, storage, i18n, theme
  features/
    shared/         # domain used by 2+ features: assets, money, spread, transaction, valuation
    coins/          # price hooks + market UI (chart, price card)
    portfolio/      # holdings store + screens that join holdings × prices
    swap/           # swap engine (pure), swap service, form, asset picker
    notifications/  # persisted swap history
    settings/       # theme, language, mock mode, reset
```

Rule: features talk only through their `index.ts` barrel, and the graph is acyclic — `coins` never
imports `portfolio`, and screens that join holdings with prices live in `portfolio`.

## Architecture & decisions

- **One write path.** A swap is the only thing that changes data. It goes through `executeSwap()`,
  a single async, API-shaped function — so dropping in a real backend later is a one-function
  change. The UI never writes to the store directly. The form validates and gates the button, so
  `executeSwap` just commits (no re-check — there's no concurrency to race locally).
- **Two kinds of state, kept apart.** Holdings, transactions, and preferences are **client state**
  (Zustand, saved to MMKV, survive a restart). Prices and history are **server state** (TanStack
  Query, in memory, refetched). They meet only at render time.
- **Prices and the swap.** The portfolio's one `/coins/markets` call gives a USD mid price per
  asset. Buy and sell are derived from it with a 0.5% spread (`sell = mid×(1−s)`,
  `buy = mid×(1+s)`). Every swap converts from-asset → USD → to-asset, so USD is the bridge. All
  money math uses big.js.
- **Rate limits and errors.** Prices are real-time. CoinGecko's demo tier is ~10–30 calls/min, so
  failures are expected: axios maps them to typed `ApiError`s in one interceptor, the query client
  retries transient ones (max 3, backoff, honoring `Retry-After`), and a single toast shows the
  error with a "use offline data" shortcut to Mock Mode. With no API key, Mock Mode (bundled JSON
  fixtures) is forced.
- **Kept lean for a challenge.** No store schema versioning or migrations (there are no prior
  installs to upgrade), no API→domain mapping layer (CoinGecko's shape is the domain here), and the
  query cache isn't persisted (only client state needs to survive a restart).

Smaller choices: `FlatList` + memoized rows for the fixed 5-asset list (virtualize only growable
lists, like the history); native sheets and toasts over hand-rolled overlays; pull-to-refresh uses
its own flag, not the query's `isRefetching`, so background refetches don't animate the spinner; the
chart scrub label formats `$` by hand because Intl isn't available inside the Reanimated worklet.

## Why these libraries

- **Expo + dev build** — a real native app (MMKV, haptics, native screens) with config-as-code and
  one-command EAS builds. A dev build rather than Expo Go because those native modules can't load in
  Expo Go.
- **Expo Router** — file-based routing that gives native stack, tabs, and sheets (via
  react-native-screens) plus typed routes, with little boilerplate.
- **Zustand** — client state with almost no ceremony: plain module-function actions, easy selectors,
  trivial to persist. Redux is overkill at this scope; Context would cause needless re-renders.
- **TanStack Query** — handles the hard parts of server data (caching, dedupe, retries,
  loading/error/stale states) so prices aren't a hand-rolled cache, and keeps server state cleanly
  separate from client state.
- **MMKV** — synchronous storage, so persisted stores rehydrate before the first render (no
  hydration flash). AsyncStorage is async and would flash.
- **NativeWind** — Tailwind classes in RN: fast, consistent styling and one light/dark token set,
  without scattering `StyleSheet` objects.
- **big.js** — exact decimal math for balances; plain JS floats lose precision on money.
- **axios** — built-in timeout and a response interceptor, so error classification lives in one
  place; less plumbing than `fetch` (no manual AbortController, query strings, or JSON parsing).
- **i18next + expo-localization** — mature i18n with pluralization and typed keys, seeded from the
  device locale.
- **react-native-wagmi-charts + react-native-svg** — a ready-made interactive chart (scrub
  gestures, line/candle) instead of building chart interaction from scratch; SVG powers the
  lightweight per-row sparkline.
- **sonner-native** — pure-JS toasts with no native build risk (a native toast lib, `burnt`, hit a
  Swift linker error, so this replaced it).
- **Jest + React Native Testing Library** — the standard Expo test stack, used here mostly on the
  pure logic.

## Testing

`bun run test` — 88 unit tests over the pure logic: money helpers, spread, portfolio valuation,
swap calculation/validation, holdings update, input sanitizer, sparkline, and API-error mapping.
Pure modules sit next to their tests (`*.ts` + `*.test.ts`) and import no React, so the core tests
without rendering anything.

## Evidence

Tested in real devices with eas build and simulators

https://github.com/user-attachments/assets/aea853f8-f005-4cc6-b00b-47cde973b7bd
