import type { CoinMarket, MarketChart } from './types';

/** Data-layer seam: implementations are interchangeable (mock ⇄ http). */
export interface PriceRepository {
  /** One batched call for all requested coins. */
  getMarkets(ids: readonly string[]): Promise<CoinMarket[]>;
  /** 24h price history for one coin. */
  getMarketChart(id: string): Promise<MarketChart>;
}
