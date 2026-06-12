# belo-challenge

Crypto-wallet **swap simulator**: consolidated portfolio, live CoinGecko prices, buy/sell spread,
asset-to-asset swaps with instant balance updates, notifications history, and EN/ES localization.

Built with Expo SDK 56 (dev build), TypeScript strict, Expo Router, NativeWind, Zustand,
TanStack Query, i18next, and Jest.

## Features

1. **Portfolio** — consolidated USD balance + per-asset holdings (USDT, USDC, DAI, BTC, ETH),
   live prices, 24h change, 7-day sparklines, pull-to-refresh, sort by value.
2. **Coin detail** — current buy/sell price (spread pair over the API mid), 24h high/low,
   interactive 24h chart (scrub crosshair + haptics), your balance, Convert shortcut.
3. **Swap** — any supported pair at real-time prices; belo-style form (auto-focus, flip with
   animation, native asset-picker sheet); validations: sufficient funds, minimum 1 USD equivalent;
   balances update immediately after a successful swap.
4. **Notifications** — success toast on swap completion + persisted history view (bell on Portfolio).
5. **Localization** — English and Spanish; follows the device language, overridable in Settings.

### Extras (not in the brief)

- Amount privacy: eye toggle masks every monetary amount (percentages/charts stay visible).
- Theming: light/dark/system, persisted, with a brand-token design system.
- Reset portfolio: re-seed balances from Settings (native confirm dialog).
- Mock-mode badge + in-app switch (see below).
- Swap deep-link: coin detail's Convert pre-selects the from-asset (`/swap?from=<coinId>`).

## Getting started

Prerequisites: [bun](https://bun.sh), Xcode (iOS). This is an Expo **dev build** project —
it does not run in Expo Go.

```bash
bun install

# optional: live prices (otherwise mock mode is forced)
echo 'EXPO_PUBLIC_COINGECKO_API_KEY=<your-demo-key>' > .env

bun run ios        # builds the dev client and starts Metro
```

Other commands: `bun run test` (Jest via jest-expo) · `bun run typecheck` · `bun run lint` ·
`bun run format`.

### Mock mode

CoinGecko's demo tier allows ~10–30 calls/min. The data layer sits behind a `PriceRepository`
interface with two implementations: HTTP (one batched `/coins/markets` call — never coin-by-coin)
and mock (captured JSON fixtures). Without an API key the app forces mock mode; with one, you can
flip the Settings switch to develop offline or when rate-limited. Typed API errors
(`RATE_LIMIT | NETWORK_ERROR | TIMEOUT | SERVER_ERROR | UNKNOWN`) drive the retry policy:
transient codes only, max 3, exponential backoff capped at 30s, with 429 `Retry-After` honored.

## Architecture

```
src/
  app/              # Expo Router routes only (no logic)
  components/       # shared UI · components/ui = design-system primitives
  lib/              # technical infra: api, errors, query, i18n, storage, theme
  features/
    shared/         # domain used by 2+ features: assets, money, spread, transaction…
    coins/          # server-state hooks + presentational market components
    portfolio/      # holdings store + screens joining holdings × market data
    swap/           # swap engine (pure), swap service, form, screens
    notifications/  # persisted swap notifications + history screen
    settings/       # theme, language, mock mode, reset
```

- Features expose a public API via `index.ts` barrels; the feature graph is acyclic
  (`coins` never imports `portfolio`; screens that join holdings × market data live in `portfolio`).
- **Server state** (prices, history) lives in TanStack Query; **client state** (holdings,
  transactions, preferences) in Zustand, persisted to MMKV with sync rehydration. The two never
  mix — they join at render, inside feature hooks.
- Store writes are exported module functions (`applySwap`, `resetPortfolio`…), never public
  setters; the swap is the app's only write and goes through an API-shaped seam (see below).

### Business rules

- Buy/sell prices are a **spread pair** over the API mid: `sell = mid × (1 − s)`,
  `buy = mid × (1 + s)`, default spread 0.5%.
- Swap conversion: from-asset at **sell** → USD → to-asset at **buy**; the spread cost is
  surfaced as the fee.
- Minimum swap: 1 USD equivalent (valued at the sell price). USD is the unit of account, not an asset.
- All money math uses big.js constructed from strings — no float arithmetic on balances;
  `.toNumber()` only at the `Transaction` record boundary.
- The swap engine is pure and fully unit-tested: `calculateSwap` + `validateSwap` (typed error
  union, never throws); `executeSwap` re-validates at confirm time as a race guard.

## Design decisions

### Balances: local state behind an API-shaped seam

In the real product, balances are server state — the backend executes a swap and returns new
holdings. This simulator keeps holdings in a Zustand store (single source of truth: sync reads,
trivial persistence, no cache-invalidation choreography for state that can't actually go stale),
but the UI never mutates it directly. The app's only write goes through an async, service-shaped
boundary — `executeSwap(params): Promise<Transaction>` — consumed via `useMutation`, so screens are
already coded against pending/error states and a `Promise`-based contract. Plugging in a real
backend later means reimplementing one function, not reworking the screens.

The alternative — modeling a full fake wallet backend with balances in the TanStack Query cache —
was rejected: it creates two sources of truth (mock storage + query cache) and forces solving
latency problems (invalidation, optimistic updates, rollback) that cannot occur locally.

### Pull-to-refresh state: own flag in the feature hook, not the query's `isRefetching`

TanStack Query can't distinguish _who_ triggered a fetch: `isRefetching` is true for every
background refetch (mock-mode toggle invalidation, staleTime expiry, future polling). Binding it to
`RefreshControl.refreshing` makes iOS animate the pull spinner in — pushing the list down — when the
user never pulled. The pull spinner belongs exclusively to the pull gesture, so the feature hook
(`usePortfolio`) owns a dedicated `isRefreshing` flag set only by its `refresh()` action, and the
screen stays purely declarative. `isPending` has no such problem (first-load only) and maps to
skeletons. This is the pattern for every screen with pull-to-refresh.

### No API→domain mapping layer

API types mirror CoinGecko's snake_case verbatim, trimmed to the consumed fields. A mapping layer
(camelCase domain models, converters, double type definitions) buys insulation from an API this app
treats as its de-facto domain vocabulary — cost without benefit at this scope. The seam where it
would slot in later is the `PriceRepository` implementations.

### Query-cache persistence: deliberately skipped

The spec's persistence requirement is satisfied by client state (Zustand → MMKV): holdings,
transactions, notifications, and preferences survive restarts. Persisting the TanStack Query cache
to disk was considered for rate-limited cold starts and skipped: stale prices rendered as fresh are
worse than a skeleton, and mock mode + the retry policy already cover the offline/limited case.

### FlatList over FlashList

The asset list is fixed at five rows — virtualization pressure is zero, so FlashList's setup cost
buys nothing. `FlatList` + memoized rows (primitive props, `(id) => void` callbacks) is enough.
Growable lists (notifications history) are virtualized; that's the rule: virtualize only what grows.

### Chart crosshair: manual `$` formatting

The scrub label runs as a Reanimated worklet on the UI thread, where Intl/i18next aren't available.
The crosshair therefore formats prices manually (`$` + fixed decimals) instead of through the app's
Intl helpers — a deliberate, contained inconsistency; all JS-thread amounts use the shared helpers.

### Native presentation over JS imitations

The asset picker started as a hand-rolled RN `Modal` bottom sheet and was replaced by a native
`formSheet` route (expo-router + react-native-screens): the JS backdrop pops in with the content,
the native sheet doesn't. Same reasoning for toasts — after a native toast lib (burnt) hit Xcode's
`SwiftUICore` linker restriction, `sonner-native` (pure JS, zero native build risk) was chosen over
maintaining a linker workaround for a toast.

### 24h change color: no neutral state (deferred)

The 24h % and the row sparkline color binary by the raw sign, while the displayed percentage is
rounded to 2 decimals — so a raw `-0.004%` renders as `0 %` tinted red, giving a "bad news" first
impression for a change that is effectively zero. A third, gray "flat" state keyed to display
precision (|pct| < 0.005) was considered and deliberately deferred: it's UX polish with no
engineering signal for this challenge's scope.

## Testing

`bun run test` — 90 unit tests over the pure modules: money helpers, spread pair, portfolio
valuation, swap calculation/validation, holdings mutation, amount-input sanitizer, sparkline
normalization, and API error mapping. Pure logic is co-located with its tests
(`*.ts` + `*.test.ts`) and kept free of React/RN imports, so the business core tests without
rendering anything.
