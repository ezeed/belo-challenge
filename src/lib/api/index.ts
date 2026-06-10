import { createMockRepository } from './mock-repository';
import type { PriceRepository } from './price-repository';

let repository: PriceRepository | undefined;

/** Mock-only until T23 adds the CoinGecko http implementation + settings flag. */
export function getPriceRepository(): PriceRepository {
  repository ??= createMockRepository();
  return repository;
}

export type { PriceRepository } from './price-repository';
export type { CoinMarket, MarketChart } from './types';
