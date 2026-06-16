import axios, { isAxiosError } from 'axios';

import { ApiError, apiErrorFromStatus } from '@/lib/errors';

import type { PriceRepository } from './price-repository';
import type { CoinMarket, MarketChart } from './types';

const BASE_URL = 'https://api.coingecko.com/api/v3';
const TIMEOUT_MS = 10_000;

/** The one place an HTTP failure is classified into a typed ApiError. */
function toApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError('TIMEOUT', { cause: error });
    }
    if (!error.response) return new ApiError('NETWORK_ERROR', { cause: error });
    return apiErrorFromStatus(
      error.response.status,
      error.response.headers['retry-after'] as string | undefined,
    );
  }
  return new ApiError('UNKNOWN', { cause: error });
}

/** Live CoinGecko (Demo plan). Failures surface as typed `ApiError`s. */
export function createCoinGeckoRepository(apiKey: string): PriceRepository {
  // eslint-disable-next-line import/no-named-as-default-member -- axios RN/ESM build doesn't re-export `create` as a named binding
  const http = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT_MS,
    headers: { 'x-cg-demo-api-key': apiKey },
  });
  http.interceptors.response.use(undefined, (error) =>
    Promise.reject(toApiError(error)),
  );

  return {
    getMarkets: (ids) =>
      http
        .get<CoinMarket[]>('/coins/markets', {
          // one batched call for all coins — never coin-by-coin
          params: { vs_currency: 'usd', ids: ids.join(','), sparkline: 'true' },
        })
        .then((response) => response.data),

    getMarketChart: (id, days) =>
      http
        .get<MarketChart>(`/coins/${id}/market_chart`, {
          params: { vs_currency: 'usd', days },
        })
        .then((response) => response.data),
  };
}
