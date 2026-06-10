export type CoinId = string;

export interface Asset {
  id: CoinId;
  symbol: string;
  name: string;
}

/** Sparse, universe-agnostic: adding a coin is a config change, not a rewrite. */
export type Holdings = Record<CoinId, number>;

export const SUPPORTED_ASSETS: readonly Asset[] = [
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin' },
  { id: 'dai', symbol: 'DAI', name: 'Dai' },
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
] as const;

export const SUPPORTED_ASSET_IDS: readonly CoinId[] = SUPPORTED_ASSETS.map(
  (asset) => asset.id,
);

export const INITIAL_HOLDINGS: Holdings = {
  tether: 1000,
  'usd-coin': 500,
  dai: 500,
  bitcoin: 0.05,
  ethereum: 1.5,
};

export function getAsset(id: CoinId): Asset | undefined {
  return SUPPORTED_ASSETS.find((asset) => asset.id === id);
}
