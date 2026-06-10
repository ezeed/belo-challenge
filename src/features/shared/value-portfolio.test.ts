import { INITIAL_HOLDINGS } from './assets';
import { valueAsset, valuePortfolio, type PriceMap } from './value-portfolio';

describe('valueAsset', () => {
  it('multiplies holding by price', () => {
    expect(valueAsset(0.05, 61514).toString()).toBe('3075.7');
  });

  it('values a missing price at 0', () => {
    expect(valueAsset(1.5).toString()).toBe('0');
  });

  it('avoids binary float drift', () => {
    expect(valueAsset(0.1, 0.2).toString()).toBe('0.02');
  });
});

describe('valuePortfolio', () => {
  const prices: PriceMap = {
    tether: 1,
    'usd-coin': 1,
    dai: 1,
    bitcoin: 61514,
    ethereum: 2453.4,
  };

  it('sums holdings × prices', () => {
    // 1000 + 500 + 500 + 0.05 × 61514 + 1.5 × 2453.4
    expect(valuePortfolio(INITIAL_HOLDINGS, prices).toString()).toBe('8755.8');
  });

  it('values assets with no price at 0', () => {
    const partial = valuePortfolio(
      { bitcoin: 0.05, ethereum: 1 },
      { bitcoin: 61514 },
    );
    expect(partial.toString()).toBe('3075.7');
  });

  it('returns 0 for empty holdings', () => {
    expect(valuePortfolio({}, prices).toString()).toBe('0');
  });
});
