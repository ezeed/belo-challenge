import { ApiError, apiErrorFromStatus } from '@/lib/errors';

import type { PriceRepository } from './price-repository';

const BASE_URL = 'https://api.coingecko.com/api/v3';
const TIMEOUT_MS = 10_000;

/** Live CoinGecko (Demo plan). Failures surface as typed `ApiError`s. */
export function createCoinGeckoRepository(apiKey: string): PriceRepository {
  async function get<T>(
    path: string,
    params: Record<string, string>,
  ): Promise<T> {
    const url = `${BASE_URL}${path}?${new URLSearchParams(params)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { 'x-cg-demo-api-key': apiKey },
        signal: controller.signal,
      });
    } catch (cause) {
      throw new ApiError(
        controller.signal.aborted ? 'TIMEOUT' : 'NETWORK_ERROR',
        {
          cause,
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw apiErrorFromStatus(
        response.status,
        response.headers.get('Retry-After'),
      );
    }

    try {
      return (await response.json()) as T;
    } catch (cause) {
      throw new ApiError('UNKNOWN', { cause });
    }
  }

  return {
    getMarkets(ids) {
      // one batched call for all coins — never coin-by-coin
      return get('/coins/markets', {
        vs_currency: 'usd',
        ids: ids.join(','),
        sparkline: 'true',
      });
    },

    getMarketChart(id) {
      return get(`/coins/${id}/market_chart`, {
        vs_currency: 'usd',
        days: '1',
      });
    },
  };
}
