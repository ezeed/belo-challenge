import type { ChartDays, CoinMarket, MarketChart } from './types';

/** Data-layer seam: implementations are interchangeable (mock ⇄ http). */
export interface PriceRepository {
  /** One batched call for all requested coins. */
  getMarkets(ids: readonly string[]): Promise<CoinMarket[]>;
  /** Price history for one coin over the given range. */
  getMarketChart(id: string, days: ChartDays): Promise<MarketChart>;
}
