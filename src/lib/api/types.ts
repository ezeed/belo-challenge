/**
 * Types mirror CoinGecko responses verbatim (snake_case), trimmed to the
 * fields the app consumes. No mapping layer — deliberate trade-off,
 * documented in the README.
 */

/** `/coins/markets` entry. */
export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  last_updated: string;
  sparkline_in_7d?: { price: number[] };
}

/** `/coins/{id}/market_chart` response. */
export interface MarketChart {
  /** `[timestamp_ms, price]` pairs. */
  prices: [number, number][];
}
