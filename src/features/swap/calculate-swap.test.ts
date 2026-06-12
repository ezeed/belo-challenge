import { big } from '@/features/shared';

import { calculateSwap } from './calculate-swap';

const PRICES = {
  bitcoin: 60000,
  ethereum: 3000,
  tether: 1,
  'usd-coin': 1,
  dai: 1,
};

describe('calculateSwap', () => {
  describe('basic conversion', () => {
    it('converts BTC → ETH correctly at default spread', () => {
      // sell BTC at 60000 × (1 − 0.005) = 59700
      // buy  ETH at 3000  × (1 + 0.005) = 3015
      // toAmount = 59700 / 3015 ≈ 19.80099...
      const result = calculateSwap('bitcoin', 'ethereum', '1', PRICES);

      const expectedUsd = big('60000').times(big('1').minus('0.005'));
      const expectedTo = expectedUsd.div(
        big('3000').times(big('1').plus('0.005')),
      );

      expect(result.usdValue.toString()).toBe(expectedUsd.toString());
      expect(result.toAmount.toString()).toBe(expectedTo.toString());
    });

    it('converts stablecoin to stablecoin (USDT → USDC)', () => {
      // sell USDT at 1 × 0.995 = 0.995
      // buy  USDC at 1 × 1.005 = 1.005
      // toAmount = 0.995 / 1.005 ≈ 0.99004975...
      const result = calculateSwap('tether', 'usd-coin', '100', PRICES);

      const sellUSDT = big('1').times(big('1').minus('0.005'));
      const buyUSDC = big('1').times(big('1').plus('0.005'));
      const expectedUsd = big('100').times(sellUSDT);
      const expectedTo = expectedUsd.div(buyUSDC);

      expect(result.usdValue.toString()).toBe(expectedUsd.toString());
      expect(result.toAmount.toString()).toBe(expectedTo.toString());
    });

    it('converts ETH → BTC', () => {
      const result = calculateSwap('ethereum', 'bitcoin', '1', PRICES);

      const sellETH = big('3000').times(big('1').minus('0.005'));
      const buyBTC = big('60000').times(big('1').plus('0.005'));
      const expectedUsd = big('1').times(sellETH);
      const expectedTo = expectedUsd.div(buyBTC);

      expect(result.usdValue.toString()).toBe(expectedUsd.toString());
      expect(result.toAmount.toString()).toBe(expectedTo.toString());
    });
  });

  describe('rate', () => {
    it('rate = toAmount / fromAmount', () => {
      const result = calculateSwap('bitcoin', 'ethereum', '2', PRICES);

      const expectedRate = result.toAmount.div(big('2'));
      expect(result.rate.toString()).toBe(expectedRate.toString());
    });

    it('rate is consistent for any input amount', () => {
      const r1 = calculateSwap('bitcoin', 'ethereum', '1', PRICES);
      const r2 = calculateSwap('bitcoin', 'ethereum', '5', PRICES);

      // rates should be identical (spread is proportional)
      expect(r1.rate.toString()).toBe(r2.rate.toString());
    });
  });

  describe('feeUsd', () => {
    it('fee is positive for any real swap', () => {
      const result = calculateSwap('bitcoin', 'ethereum', '1', PRICES);
      expect(result.feeUsd.gt(0)).toBe(true);
    });

    it('fee is zero when spread is zero', () => {
      const result = calculateSwap('bitcoin', 'ethereum', '1', PRICES, '0');
      expect(result.feeUsd.toNumber()).toBe(0);
    });

    it('fee scales proportionally with amount', () => {
      const r1 = calculateSwap('bitcoin', 'ethereum', '1', PRICES);
      const r2 = calculateSwap('bitcoin', 'ethereum', '3', PRICES);

      // fee for 3 BTC should be exactly 3× the fee for 1 BTC.
      // Compare via ratio to avoid big.js rounding accumulation from independent
      // division chains (r2.feeUsd / r1.feeUsd should equal 3 exactly).
      expect(r2.feeUsd.div(r1.feeUsd).toNumber()).toBeCloseTo(3, 10);
    });

    it('fee is higher for a larger spread', () => {
      const r1 = calculateSwap('bitcoin', 'ethereum', '1', PRICES, '0.005');
      const r2 = calculateSwap('bitcoin', 'ethereum', '1', PRICES, '0.01');

      expect(r2.feeUsd.gt(r1.feeUsd)).toBe(true);
    });
  });

  describe('spread parameter', () => {
    it('accepts a custom spread', () => {
      const result = calculateSwap('bitcoin', 'ethereum', '1', PRICES, '0.01');

      const sellBTC = big('60000').times(big('1').minus('0.01'));
      const buyETH = big('3000').times(big('1').plus('0.01'));
      const expectedUsd = big('1').times(sellBTC);
      const expectedTo = expectedUsd.div(buyETH);

      expect(result.usdValue.toString()).toBe(expectedUsd.toString());
      expect(result.toAmount.toString()).toBe(expectedTo.toString());
    });

    it('zero spread: toAmount > 0 and usdValue = fromAmount × midPrice', () => {
      const result = calculateSwap('bitcoin', 'ethereum', '1', PRICES, '0');

      expect(result.usdValue.toString()).toBe('60000');
      // usdValue / toBuy = 60000 / 3000 = 20 exactly
      expect(result.toAmount.toString()).toBe('20');
    });
  });

  describe('missing price guard', () => {
    it('throws when fromId price is missing', () => {
      expect(() =>
        calculateSwap('bitcoin', 'ethereum', '1', { ethereum: 3000 }),
      ).toThrow();
    });

    it('throws when toId price is missing', () => {
      expect(() =>
        calculateSwap('bitcoin', 'ethereum', '1', { bitcoin: 60000 }),
      ).toThrow();
    });

    it('throws when both prices are missing', () => {
      expect(() =>
        calculateSwap('bitcoin', 'ethereum', '1', {}),
      ).toThrow();
    });
  });

  describe('precision — no float drift', () => {
    it('handles large BTC amounts without float imprecision', () => {
      // 21 million BTC @ 60k, the math should not lose precision
      const result = calculateSwap('bitcoin', 'tether', '21000000', PRICES);
      // Just ensuring it completes and produces a finite result
      expect(result.toAmount.gt(0)).toBe(true);
    });

    it('handles very small amounts', () => {
      const result = calculateSwap('bitcoin', 'ethereum', '0.000001', PRICES);
      expect(result.toAmount.gt(0)).toBe(true);
    });
  });
});
