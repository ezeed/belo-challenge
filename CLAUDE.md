# belo-challenge

Crypto-wallet swap simulator. Expo SDK 56 dev build (never Expo Go) · TypeScript strict · bun.
Expo API reference: https://docs.expo.dev/versions/v56.0.0/

Keep this file updated: every feature added appends its definitions/rules to the relevant section.

## Commands

- Install: `bun install` · Native modules: `bunx expo install <pkg>` (never `bun add`)
- Run: `bun run ios`
- Typecheck: `bun run typecheck` · Lint: `bun run lint` · Format: `bun run format`
- Test: `bun run test` (Jest via jest-expo — `bun test` invokes bun's own runner, do not use)
- Query inspection: `@dev-plugins/react-query` (RN DevTools Network tab is dead in dev builds — multi-host limitation); open via `shift+m` in the expo CLI or the in-app dev menu.

## Requirements

Stack: NativeWind · Zustand (client state) · TanStack Query (server state) · Jest + RNTL · i18next · CoinGecko API.

1. Portfolio: consolidated balance in USD + asset list with current holdings.
   Seed balances: USDT 1,000 · USDC 500 · DAI 500 · BTC 0.05 · ETH 1.5.
2. Coin detail: current buy/sell price in USD (from API) + 24h price history chart.
3. Swap: any supported pair · real-time API prices · portfolio balance updates immediately after a successful swap.
   Validations: sufficient funds · minimum amount = 1 USD equivalent.
4. Notifications: in-app alert when a swap completes + history view.
5. Localization: EN + ES.

Constraints: CoinGecko rate limit ≈ 10–30 calls/min — handle with caching + error handling. Mock Mode switch (local JSON) as fallback.

## Business rules

- Swap = the app's only write operation (asset→asset).
- Buy/Sell price = spread pair: `sell = mid × (1 − s)` · `buy = mid × (1 + s)` — `spreadPair(mid, s?)`, `DEFAULT_SPREAD` 0.5% (`features/shared/spread.ts`); T14's swap legs reuse it.
- Swap conversion: from-asset @ sell → USD → to-asset @ buy.
- Assets: USDT, USDC, DAI, BTC, ETH. USD = unit of account, not an asset.
- Asset catalog, `CoinId`, `Holdings = Record<CoinId, number>`, seed balances: `src/features/shared/assets.ts`.
- `Transaction` record: id · timestamp (ms) · fromId/toId · fromAmount/toAmount · usdValue · rate · feeUsd (`src/features/shared/transaction.ts`).
- Money math: big.js via `big()` from `src/features/shared/money.ts`; construct from string for precision. No float arithmetic on balances.
- Money display: `formatUsd` / `formatAmount` / `formatPercent` (Intl-based, locale param).
- Portfolio valuation: `valueAsset(amount, price?)` / `valuePortfolio(holdings, prices)` + `PriceMap` (`src/features/shared/value-portfolio.ts`); missing price values as 0.

## Architecture

- `src/app/` = routes only.
- `src/components/` = shared UI · `src/components/ui/` = design-system primitives.
- `src/lib/` = technical infra (theme, and per future tasks: api, errors, query, i18n).
- `src/features/<feature>/` = business logic; public API via `index.ts` barrel; cross-feature imports through barrels only.
- `src/features/shared/` = domain logic used by 2+ features.
- Feature graph is acyclic: `coins` (server-state hooks + presentational market components) never imports `portfolio`. Screens joining holdings × market data (`portfolio-screen`, `coin-detail-screen`) live in `features/portfolio` — putting them in `coins` would create a barrel require cycle.
- Pure logic: co-located `*.ts` + `*.test.ts`.
- Hooks: `use-<name>.ts` (kebab-case), owned by `features/<feature>/hooks/` or their `lib/<module>/`. No global hooks directory.
- Aliases: `@/*` → `./src/*` · `@/assets/*` → `./assets/*`.

## State & data

- TanStack Query = server state (prices, history). Zustand = client state. Never cross the two.
- Holdings: zustand store (`features/portfolio/store.ts`) = single source of truth (holdings + transactions); UI reads via selectors. Balances never enter the query cache.
- Persistence: MMKV via `zustandStorage` adapter (`src/lib/storage/`) + zustand `persist` (sync rehydration — no hydration flash). Persisted stores: portfolio, notifications (`features/notifications/store.ts`), settings (theme/language), privacy. Session-only by design: mock mode.
- Store actions = exported module functions (`applySwap`, `resetPortfolio`, `addNotification`, `setTheme`…), never setters on the hook. `applySwap` is swap-service-only; holdings math via pure `applySwapToHoldings` (`features/portfolio/apply-swap.ts`).
- Writes: UI never mutates the store directly — the swap goes through the API-shaped seam `executeSwap(params): Promise<Transaction>` (`features/swap/swap-service.ts`), consumed via `useMutation`; sync/local inside, HTTP-swappable later. Store exposes no public setters.
- Swap engine: pure `calculateSwap(fromId, toId, fromAmount, prices, spread?) → { toAmount, usdValue, rate, feeUsd }` (all Big) + `validateSwap` typed union `INVALID_AMOUNT | SAME_ASSET | INSUFFICIENT_FUNDS | BELOW_MINIMUM | MISSING_PRICE` (never throws; min = 1 USD at sell price) — `features/swap/`, pure modules import only `features/shared`. `executeSwap` throws `SwapValidationError` (`.code`) as the confirm-time race guard; `.toNumber()` only at the Transaction boundary; Transaction id = `"${Date.now()}-${random}"`. Notifications are T16's hook, not the service.
- Amount privacy: `usePrivacyStore` + `toggleHideAmounts` + `MASKED_AMOUNT` (`features/shared/privacy-store.ts`, persisted). Free-Range extra (not in the brief) — list under README extras. Every monetary amount renders `MASKED_AMOUNT` when `hideAmounts`; percentages/sparklines stay visible. Eye toggle lives on the balance card.
- Data layer: `PriceRepository` (`getMarkets(ids)`, `getMarketChart(id)`) in `src/lib/api/`; implementations swap behind `getPriceRepository()`: mock (captured fixtures in `lib/api/fixtures/`) ⇄ http (`coingecko-repository.ts`, one batched `/coins/markets` call — never coin-by-coin).
- Repository selection: `useMock = mockMode || !apiKey` — key from `EXPO_PUBLIC_COINGECKO_API_KEY` (`.env`, gitignored); mock mode = zustand store in `lib/api/mock-mode.ts` (session-only); the Settings toggle must `queryClient.invalidateQueries()` after switching; keyless → toggle disabled, mock forced.
- Mock-mode reads: UI uses `useMockActive()` (reactive — badge, switch); data layer uses `isMockActive()`/`activeApiKey()` (snapshot). Never read a non-reactive flag during render.
- API errors: typed `ApiError` with code union `RATE_LIMIT | NETWORK_ERROR | TIMEOUT | SERVER_ERROR | UNKNOWN` (`src/lib/errors/`); never surface raw fetch errors.
- Query retry policy (queryClient defaults): transient codes only, max 3, exponential backoff capped 30s; 429 `Retry-After` overrides the backoff delay.
- API types (`src/lib/api/types.ts`) mirror CoinGecko snake_case verbatim, trimmed to consumed fields. No API→domain mapping layer — documented README trade-off.
- `queryClient`: `src/lib/query/`, `staleTime` 60s; `QueryClientProvider` mounted in the root layout. Query-cache disk persistence deliberately skipped — spec §6 persistence = client state (Zustand), and mock mode + retry cover the rate-limited cold start (README trade-off).
- Server-state hooks live in `features/coins/hooks/` (`useMarkets` — one batched markets query; `placeholderData: keepPreviousData` keeps last good prices across refetch errors + mock-mode key changes).
- Client/server state join at render only, via feature hooks (`usePortfolio` — holdings × prices → rows + total; row props kept primitive for `memo`).
- Pull-to-refresh: feature hooks own a dedicated `isRefreshing` + `refresh()` (set only by the pull gesture) — never bind `RefreshControl.refreshing` to the query's `isRefetching` (background refetches would animate the spinner in). Screens stay declarative.
- Fixed 5-asset list = `FlatList` + memoized rows (deliberately not FlashList — README trade-off). Virtualize only growable lists.
- Memoized list rows: callbacks are `(id) => void` + the row's `id` prop — never per-row inline closures (they defeat `memo`).
- Coin detail (`features/portfolio/coin-detail-screen.tsx`): `useCoinMarket(id)` derives one coin from the batched markets query (never a per-coin request); Convert CTA renders only when holding > 0 → `/swap?from=<id>`; screen sets its native header title via `<Stack.Screen options>`. Balance line masks under `hideAmounts`; market prices don't.

## i18n

- i18next + react-i18next; init in `src/lib/i18n/` (side-effect import in the root layout). `intl-pluralrules` polyfill imported first — Hermes lacks `Intl.PluralRules`, which i18next v24+ requires for plural resolution.
- Root-layout launch effect (re-apply persisted theme/language) is mount-once (`[]` deps, lint-disabled on purpose): nativewind's `setColorScheme` is unstable per render and the layout re-renders on language change (`useTranslation` Stack titles) — depending on it loops `changeLanguage` → re-render → effect → crash.
- Languages: `en`, `es`; default from device locale (expo-localization), fallback `en`.
- Resources: `src/lib/i18n/locales/{en,es}.json` — keys namespaced by feature, single `translation` namespace, typed via `i18next.d.ts`.
- All user-facing strings through `t('...')`. No hardcoded strings.
- Numbers/currency: `features/shared/money.ts` Intl helpers, never i18next formatting.
- Language preference: persisted in `features/settings/store.ts` (`null` = follow device); the settings `LanguageCard` calls `i18n.changeLanguage`, and the root layout re-applies it on launch. Language autonyms (`English`, `Español`) stay untranslated across locales.

## Theming

- Components use semantic Tailwind classes (`bg-primary`, `text-text-muted`). No raw hex.
- Token sources kept in sync: `src/global.css` (HSL vars) ↔ `tailwind.config.js` ↔ `src/lib/theme/colors.ts` (raw hex).
- `primary` = belo-indigo (light) / belo-mint (dark). `bg-primary` pairs with `text-primary-foreground`.
- Native-prop consumers (NativeTabs, navigation theme): `useTheme().colors` from `@/lib/theme`.
- Selected/active states that need the primary brand color (segmented picker, mock badge, Switch `trackColor`): use `useTheme().colors` inline `style`, not `bg-primary`/`border-primary` classes — CSS-var color classes resolve unreliably in RN. Tint = 8-digit hex (`${colors.primary}1F`).
- Theme preference: persisted in `features/settings/store.ts` (`system`/`light`/`dark`); the settings `ThemeCard` drives `setColorScheme`, and the root layout re-applies it on launch. `system` defers to nativewind/device.
- Visual changes: verify light and dark.
- `components/ui/` primitives: pull via `bunx @react-native-reusables/cli@latest add <name>` (copied source, owned in-repo). On arrival translate shadcn tokens → ours: `foreground→text` · `muted-foreground→text-muted` · `card→surface` · `muted`/`accent→surface-muted` · `destructive→danger`.
- Text: use `Text` from `@/components/ui/text` (cva variants), not RN `Text`.

## Navigation

- Root Stack in `src/app/_layout.tsx` (providers + Stack); tabs group at `(tabs)/_layout.tsx` renders `app-tabs.tsx` with `headerShown: false`.
- Route map: `(tabs)/index` (Portfolio) · `(tabs)/swap` (Swap, accepts `?from=<coinId>`) · `(tabs)/settings` · `coin/[id]` (pushed) · `notifications` (pushed from Portfolio bell).
- NativeTabs (`expo-router/unstable-native-tabs`) in `src/components/app-tabs.tsx`.
- Tabs: Portfolio (`index`) · Swap · Settings.
- Tab icons: SF Symbols (`sf`) + Material (`md`). Lucide for in-screen icons.
- Portfolio screen header: bell icon (Lucide `Bell`) → pushes `/notifications`.
- Asset picker is NOT a route — it is a modal component owned by `features/swap/` (T15).

## Charts

- Row sparkline: hand-rolled memoized `react-native-svg` polyline (`src/components/sparkline.tsx`), `chartUp`/`chartDown` from `useTheme().colors`. Default window: last 24 points of the hourly 7d series = 24h. Direction color: pass `isUp` from the same value displayed next to the chart (`price_change_percentage_24h`) — the lazily-refreshed sparkline series can contradict the live %; endpoints are only the fallback. Never mount a chart-lib component per list row.
- Point normalization: pure `sparklinePoints(prices, width, height, padding?, minRangeRatio?)` (`src/components/sparkline-points.ts`); display-only math, big.js not required. `minRangeRatio` = range floor so stablecoin-tiny ranges render near-flat (component uses 0.005).
- 24h chart: `PriceChart` (`features/coins/components/price-chart.tsx`) — wagmi-charts `LineChart` + `CursorCrosshair`, haptic on activate (expo-haptics). `useMarketChart(id)` (`features/coins/hooks/`) is the app's only per-coin query (`['market-chart', id]`, `keepPreviousData`). Scrub texts must sit inside `LineChart.Provider`; line color = same `isUp` rule as the sparkline. Crosshair `format` runs as a Reanimated worklet — no Intl/i18n inside; manual `$` formatting is a documented trade-off. `GestureHandlerRootView` wraps the root layout.

## Code style

- Strict TS, no `any`. Functional patterns.
- Styling: Tailwind classes only — no inline style objects. Third-party components get className via `cssInterop` wrappers in `components/ui/` (e.g. `Image`). If className is truly unsupported, `StyleSheet.create`.
- Interactive elements: `accessibilityLabel` + `accessibilityRole`; support font scaling.
- Commits: shortest possible message, no Co-Authored-By trailers.
- Never commit or push automatically — after typecheck/lint/test pass, stop and wait for explicit manual confirmation before `git commit`/`git push`.
