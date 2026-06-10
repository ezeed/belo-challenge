import { createCoinGeckoRepository } from './coingecko-repository';
import { activeApiKey } from './mock-mode';
import { createMockRepository } from './mock-repository';
import type { PriceRepository } from './price-repository';

const instances: { mock?: PriceRepository; http?: PriceRepository } = {};

export function getPriceRepository(): PriceRepository {
  const key = activeApiKey();
  return key
    ? (instances.http ??= createCoinGeckoRepository(key))
    : (instances.mock ??= createMockRepository());
}

export {
  hasApiKey,
  isMockActive,
  setMockMode,
  useMockActive,
} from './mock-mode';
export type { PriceRepository } from './price-repository';
export type { CoinMarket, MarketChart } from './types';
