import { big } from './money';
import { DEFAULT_SPREAD, spreadPair } from './spread';

describe('spreadPair', () => {
  it('applies the default 0.5% spread symmetrically', () => {
    const { sell, buy } = spreadPair('100');
    expect(sell.toString()).toBe('99.5');
    expect(buy.toString()).toBe('100.5');
  });

  it('accepts a custom spread', () => {
    const { sell, buy } = spreadPair('200', '0.01');
    expect(sell.toString()).toBe('198');
    expect(buy.toString()).toBe('202');
  });

  it('always brackets the mid: sell < mid < buy', () => {
    for (const mid of ['0.999843', '1', '67250.42', '3521.07']) {
      const { sell, buy } = spreadPair(mid);
      expect(sell.lt(mid)).toBe(true);
      expect(buy.gt(mid)).toBe(true);
    }
  });

  it('is exact on decimal mids (no float drift)', () => {
    const { sell, buy } = spreadPair('0.1');
    expect(sell.toString()).toBe('0.0995');
    expect(buy.toString()).toBe('0.1005');
  });

  it('a zero mid quotes zero both sides', () => {
    const { sell, buy } = spreadPair('0');
    expect(sell.eq(0)).toBe(true);
    expect(buy.eq(0)).toBe(true);
  });

  it('default spread is 0.5%', () => {
    expect(big(DEFAULT_SPREAD).toString()).toBe('0.005');
  });
});
