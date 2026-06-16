import type { PriceRepository } from './price-repository';
import type { ChartDays, CoinMarket, MarketChart } from './types';

import chartBitcoin from './fixtures/market-chart-bitcoin.json';
import chartBitcoin7d from './fixtures/market-chart-bitcoin-7d.json';
import chartBitcoin30d from './fixtures/market-chart-bitcoin-30d.json';
import chartBitcoin365d from './fixtures/market-chart-bitcoin-365d.json';
import chartDai from './fixtures/market-chart-dai.json';
import chartDai7d from './fixtures/market-chart-dai-7d.json';
import chartDai30d from './fixtures/market-chart-dai-30d.json';
import chartDai365d from './fixtures/market-chart-dai-365d.json';
import chartEthereum from './fixtures/market-chart-ethereum.json';
import chartEthereum7d from './fixtures/market-chart-ethereum-7d.json';
import chartEthereum30d from './fixtures/market-chart-ethereum-30d.json';
import chartEthereum365d from './fixtures/market-chart-ethereum-365d.json';
import chartTether from './fixtures/market-chart-tether.json';
import chartTether7d from './fixtures/market-chart-tether-7d.json';
import chartTether30d from './fixtures/market-chart-tether-30d.json';
import chartTether365d from './fixtures/market-chart-tether-365d.json';
import chartUsdCoin from './fixtures/market-chart-usd-coin.json';
import chartUsdCoin7d from './fixtures/market-chart-usd-coin-7d.json';
import chartUsdCoin30d from './fixtures/market-chart-usd-coin-30d.json';
import chartUsdCoin365d from './fixtures/market-chart-usd-coin-365d.json';
import marketsFixture from './fixtures/markets.json';

// JSON imports type `prices` as number[][]; the fixture rows are [ts, price] pairs.
// Unsuffixed files = 1 day (5-minutely); -7d/-30d hourly; -365d daily.
const CHART_FIXTURES = {
  1: {
    bitcoin: chartBitcoin,
    dai: chartDai,
    ethereum: chartEthereum,
    tether: chartTether,
    'usd-coin': chartUsdCoin,
  },
  7: {
    bitcoin: chartBitcoin7d,
    dai: chartDai7d,
    ethereum: chartEthereum7d,
    tether: chartTether7d,
    'usd-coin': chartUsdCoin7d,
  },
  30: {
    bitcoin: chartBitcoin30d,
    dai: chartDai30d,
    ethereum: chartEthereum30d,
    tether: chartTether30d,
    'usd-coin': chartUsdCoin30d,
  },
  365: {
    bitcoin: chartBitcoin365d,
    dai: chartDai365d,
    ethereum: chartEthereum365d,
    tether: chartTether365d,
    'usd-coin': chartUsdCoin365d,
  },
} as unknown as Record<ChartDays, Record<string, MarketChart>>;

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

    async getMarketChart(id, days) {
      await delay(SIMULATED_LATENCY_MS);
      const chart = CHART_FIXTURES[days][id];
      if (!chart) {
        throw new Error(`No mock chart fixture for coin "${id}" (${days}d)`);
      }
      return chart;
    },
  };
}
