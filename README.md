# belo-challenge

## Design decisions

<!-- Section grows as decisions land; full README rewrite happens in T22. -->

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

### 24h change color: no neutral state (deferred)

The 24h % and the row sparkline color binary by the raw sign, while the displayed percentage is
rounded to 2 decimals — so a raw `-0.004%` renders as `0 %` tinted red, giving a "bad news" first
impression for a change that is effectively zero. A third, gray "flat" state keyed to display
precision (|pct| < 0.005) was considered and deliberately deferred: it's UX polish with no
engineering signal for this challenge's scope.

---

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
