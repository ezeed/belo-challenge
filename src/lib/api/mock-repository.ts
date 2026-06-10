import type { PriceRepository } from './price-repository';
import type { CoinMarket, MarketChart } from './types';

import chartBitcoin from './fixtures/market-chart-bitcoin.json';
import chartDai from './fixtures/market-chart-dai.json';
import chartEthereum from './fixtures/market-chart-ethereum.json';
import chartTether from './fixtures/market-chart-tether.json';
import chartUsdCoin from './fixtures/market-chart-usd-coin.json';
import marketsFixture from './fixtures/markets.json';

// JSON imports type `prices` as number[][]; the fixture rows are [ts, price] pairs.
const CHART_FIXTURES = {
  bitcoin: chartBitcoin,
  dai: chartDai,
  ethereum: chartEthereum,
  tether: chartTether,
  'usd-coin': chartUsdCoin,
} as unknown as Record<string, MarketChart>;

const SIMULATED_LATENCY_MS = 350;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Serves captured CoinGecko payloads — same shape as the live API. */
export function createMockRepository(): PriceRepository {
  return {
    async getMarkets(ids) {
      await delay(SIMULATED_LATENCY_MS);
      return (marketsFixture as CoinMarket[]).filter((coin) =>
        ids.includes(coin.id),
      );
    },

    async getMarketChart(id) {
      await delay(SIMULATED_LATENCY_MS);
      const chart = CHART_FIXTURES[id];
      if (!chart) {
        throw new Error(`No mock chart fixture for coin "${id}"`);
      }
      return chart;
    },
  };
}
