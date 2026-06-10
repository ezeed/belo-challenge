# belo-challenge

Crypto-wallet swap simulator. Expo SDK 56 dev build (never Expo Go) · TypeScript strict · bun.
Expo API reference: https://docs.expo.dev/versions/v56.0.0/

Keep this file updated: every feature added appends its definitions/rules to the relevant section.

## Commands

- Install: `bun install` · Native modules: `bunx expo install <pkg>` (never `bun add`)
- Run: `bun run ios`
- Typecheck: `bun run typecheck` · Lint: `bun run lint` · Format: `bun run format`
- Test: `bun run test` (Jest via jest-expo — `bun test` invokes bun's own runner, do not use)

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
- Buy/Sell price = spread pair: `sell = mid × (1 − s)` · `buy = mid × (1 + s)`.
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
- Pure logic: co-located `*.ts` + `*.test.ts`.
- Hooks: `use-<name>.ts` (kebab-case), owned by `features/<feature>/hooks/` or their `lib/<module>/`. No global hooks directory.
- Aliases: `@/*` → `./src/*` · `@/assets/*` → `./assets/*`.

## State & data

- TanStack Query = server state (prices, history). Zustand = client state. Never cross the two.
- Holdings: zustand store (`features/portfolio/store.ts`) = single source of truth; UI reads via selectors. Balances never enter the query cache.
- Writes: UI never mutates the store directly — the swap goes through the API-shaped seam `executeSwap(params): Promise<Transaction>` (`features/swap/swap-service.ts`), consumed via `useMutation`; sync/local inside, HTTP-swappable later. Store exposes no public setters.
- Data layer: `PriceRepository` (`getMarkets(ids)`, `getMarketChart(id)`) in `src/lib/api/`; implementations swap behind `getPriceRepository()`. Current: mock (captured CoinGecko fixtures in `lib/api/fixtures/`).
- API types (`src/lib/api/types.ts`) mirror CoinGecko snake_case verbatim, trimmed to consumed fields. No API→domain mapping layer — documented README trade-off.
- `queryClient`: `src/lib/query/`, `staleTime` 60s; `QueryClientProvider` mounted in the root layout.
- Server-state hooks live in `features/coins/hooks/` (`useMarkets` — one batched markets query).
- Client/server state join at render only, via feature hooks (`usePortfolio` — holdings × prices → rows + total; row props kept primitive for `memo`).
- Fixed 5-asset list = `FlatList` + memoized rows (deliberately not FlashList — README trade-off). Virtualize only growable lists.

## i18n

- i18next + react-i18next; init in `src/lib/i18n/` (side-effect import in the root layout).
- Languages: `en`, `es`; default from device locale (expo-localization), fallback `en`.
- Resources: `src/lib/i18n/locales/{en,es}.json` — keys namespaced by feature, single `translation` namespace, typed via `i18next.d.ts`.
- All user-facing strings through `t('...')`. No hardcoded strings.
- Numbers/currency: `features/shared/money.ts` Intl helpers, never i18next formatting.

## Theming

- Components use semantic Tailwind classes (`bg-primary`, `text-text-muted`). No raw hex.
- Token sources kept in sync: `src/global.css` (HSL vars) ↔ `tailwind.config.js` ↔ `src/lib/theme/colors.ts` (raw hex).
- `primary` = belo-indigo (light) / belo-mint (dark). `bg-primary` pairs with `text-primary-foreground`.
- Native-prop consumers (NativeTabs, navigation theme): `useTheme().colors` from `@/lib/theme`.
- Visual changes: verify light and dark.
- `components/ui/` primitives: pull via `bunx @react-native-reusables/cli@latest add <name>` (copied source, owned in-repo). On arrival translate shadcn tokens → ours: `foreground→text` · `muted-foreground→text-muted` · `card→surface` · `muted`/`accent→surface-muted` · `destructive→danger`.
- Text: use `Text` from `@/components/ui/text` (cva variants), not RN `Text`.

## Navigation

- NativeTabs (`expo-router/unstable-native-tabs`) in `src/components/app-tabs.tsx`.
- Tabs: Home (`index`) · Swap · Settings.
- Tab icons: SF Symbols (`sf`) + Material (`md`). Lucide for in-screen icons.

## Code style

- Strict TS, no `any`. Functional patterns.
- Styling: Tailwind classes only — no inline style objects. Third-party components get className via `cssInterop` wrappers in `components/ui/` (e.g. `Image`). If className is truly unsupported, `StyleSheet.create`.
- Interactive elements: `accessibilityLabel` + `accessibilityRole`; support font scaling.
- Commits: shortest possible message, no Co-Authored-By trailers.
