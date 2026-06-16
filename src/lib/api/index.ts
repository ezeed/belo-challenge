import { createCoinGeckoRepository } from './coingecko-repository';
import { activeApiKey } from './mock-mode';
import { createMockRepository } from './mock-repository';
import type { PriceRepository } from './price-repository';

export function getPriceRepository(): PriceRepository {
  const key = activeApiKey();
  return key ? createCoinGeckoRepository(key) : createMockRepository();
}

export {
  hasApiKey,
  isMockActive,
  setMockMode,
  useMockActive,
} from './mock-mode';
export type { PriceRepository } from './price-repository';
export type { ChartDays, CoinMarket, MarketChart } from './types';
