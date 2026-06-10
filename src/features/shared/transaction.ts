import type { CoinId } from './assets';

export interface Transaction {
  id: string;
  /** Unix epoch in milliseconds. */
  timestamp: number;
  fromId: CoinId;
  toId: CoinId;
  fromAmount: number;
  toAmount: number;
  /** USD value of the swap at execution time. */
  usdValue: number;
  /** Units of `toId` received per 1 unit of `fromId`. */
  rate: number;
  /** Spread cost in USD. */
  feeUsd: number;
}
