import { validateSwap } from './validate-swap';

const PRICES = {
  bitcoin: 60000,
  ethereum: 3000,
  tether: 1,
  'usd-coin': 1,
  dai: 1,
};

const HOLDINGS = {
  bitcoin: 1,
  ethereum: 5,
  tether: 1000,
  'usd-coin': 500,
  dai: 500,
};

function valid(fromAmount: string, fromId = 'bitcoin', toId = 'ethereum') {
  return validateSwap({
    fromId,
    toId,
    fromAmount,
    holdings: HOLDINGS,
    prices: PRICES,
  });
}

describe('validateSwap', () => {
  describe('INVALID_AMOUNT', () => {
    it('rejects zero', () => {
      expect(valid('0').ok).toBe(false);
      expect((valid('0') as { ok: false; error: string }).error).toBe(
        'INVALID_AMOUNT',
      );
    });

    it('rejects negative amounts', () => {
      expect(valid('-1').ok).toBe(false);
      expect((valid('-1') as { ok: false; error: string }).error).toBe(
        'INVALID_AMOUNT',
      );
    });

    it('rejects NaN string', () => {
      expect(valid('NaN').ok).toBe(false);
      expect((valid('NaN') as { ok: false; error: string }).error).toBe(
        'INVALID_AMOUNT',
      );
    });

    it('rejects empty string', () => {
      expect(valid('').ok).toBe(false);
      expect((valid('') as { ok: false; error: string }).error).toBe(
        'INVALID_AMOUNT',
      );
    });

    it('rejects non-numeric string', () => {
      expect(valid('abc').ok).toBe(false);
      expect((valid('abc') as { ok: false; error: string }).error).toBe(
        'INVALID_AMOUNT',
      );
    });

    it('rejects Infinity-like strings', () => {
      expect(valid('Infinity').ok).toBe(false);
      expect((valid('Infinity') as { ok: false; error: string }).error).toBe(
        'INVALID_AMOUNT',
      );
    });
  });

  describe('SAME_ASSET', () => {
    it('rejects BTC -> BTC', () => {
      const result = validateSwap({
        fromId: 'bitcoin',
        toId: 'bitcoin',
        fromAmount: '0.1',
        holdings: HOLDINGS,
        prices: PRICES,
      });
      expect(result.ok).toBe(false);
      expect((result as { ok: false; error: string }).error).toBe('SAME_ASSET');
    });

    it('rejects USDT -> USDT', () => {
      const result = validateSwap({
        fromId: 'tether',
        toId: 'tether',
        fromAmount: '10',
        holdings: HOLDINGS,
        prices: PRICES,
      });
      expect(result.ok).toBe(false);
      expect((result as { ok: false; error: string }).error).toBe('SAME_ASSET');
    });
  });

  describe('MISSING_PRICE', () => {
    it('rejects when fromId price is missing', () => {
      const result = validateSwap({
        fromId: 'bitcoin',
        toId: 'ethereum',
        fromAmount: '1',
        holdings: HOLDINGS,
        prices: { ethereum: 3000 },
      });
      expect(result.ok).toBe(false);
      expect((result as { ok: false; error: string }).error).toBe(
        'MISSING_PRICE',
      );
    });

    it('rejects when toId price is missing', () => {
      const result = validateSwap({
        fromId: 'bitcoin',
        toId: 'ethereum',
        fromAmount: '1',
        holdings: HOLDINGS,
        prices: { bitcoin: 60000 },
      });
      expect(result.ok).toBe(false);
      expect((result as { ok: false; error: string }).error).toBe(
        'MISSING_PRICE',
      );
    });

    it('rejects when both prices are missing', () => {
      const result = validateSwap({
        fromId: 'bitcoin',
        toId: 'ethereum',
        fromAmount: '1',
        holdings: HOLDINGS,
        prices: {},
      });
      expect(result.ok).toBe(false);
      expect((result as { ok: false; error: string }).error).toBe(
        'MISSING_PRICE',
      );
    });
  });

  describe('BELOW_MINIMUM', () => {
    it('rejects amounts below 1 USD equivalent (at sell price)', () => {
      // BTC sell price = 60000 * 0.995 = 59700
      // 1 USD = 1/59700 BTC ~ 0.00001675...
      // Amount just under the minimum
      const justUnder = ((1 / (60000 * 0.995)) * 0.99).toFixed(10);
      const result = validateSwap({
        fromId: 'bitcoin',
        toId: 'ethereum',
        fromAmount: justUnder,
        holdings: { ...HOLDINGS, bitcoin: 1 },
        prices: PRICES,
      });
      expect(result.ok).toBe(false);
      expect((result as { ok: false; error: string }).error).toBe(
        'BELOW_MINIMUM',
      );
    });

    it('accepts amounts exactly at or above 1 USD equivalent', () => {
      // Amount that exactly produces 1 USD at sell price: 1 / sellPrice
      // sellPrice = 60000 * 0.995 = 59700
      // Exact minimum: "0.00001675041875..." -- use a safely-above value
      const justAbove = (1.01 / (60000 * 0.995)).toFixed(10);
      const result = validateSwap({
        fromId: 'bitcoin',
        toId: 'ethereum',
        fromAmount: justAbove,
        holdings: { ...HOLDINGS, bitcoin: 1 },
        prices: PRICES,
      });
      expect(result.ok).toBe(true);
    });

    it('rejects stablecoin amount below 1 USD', () => {
      // USDT sell = 1 * 0.995 = 0.995; need > 1/0.995 ~ 1.005 USDT
      const result = validateSwap({
        fromId: 'tether',
        toId: 'usd-coin',
        fromAmount: '0.5',
        holdings: HOLDINGS,
        prices: PRICES,
      });
      expect(result.ok).toBe(false);
      expect((result as { ok: false; error: string }).error).toBe(
        'BELOW_MINIMUM',
      );
    });

    it('accepts stablecoin amount above minimum', () => {
      const result = validateSwap({
        fromId: 'tether',
        toId: 'usd-coin',
        fromAmount: '1.1',
        holdings: HOLDINGS,
        prices: PRICES,
      });
      expect(result.ok).toBe(true);
    });
  });

  describe('INSUFFICIENT_FUNDS', () => {
    it('rejects when amount exceeds balance', () => {
      const result = validateSwap({
        fromId: 'bitcoin',
        toId: 'ethereum',
        fromAmount: '2',
        holdings: HOLDINGS,
        prices: PRICES,
      });
      expect(result.ok).toBe(false);
      expect((result as { ok: false; error: string }).error).toBe(
        'INSUFFICIENT_FUNDS',
      );
    });

    it('accepts exact balance (full sweep)', () => {
      const result = validateSwap({
        fromId: 'bitcoin',
        toId: 'ethereum',
        fromAmount: '1',
        holdings: HOLDINGS,
        prices: PRICES,
      });
      expect(result.ok).toBe(true);
    });

    it('accepts amount just under balance', () => {
      const result = validateSwap({
        fromId: 'bitcoin',
        toId: 'ethereum',
        fromAmount: '0.9999',
        holdings: HOLDINGS,
        prices: PRICES,
      });
      expect(result.ok).toBe(true);
    });
  });

  describe('valid swaps', () => {
    it('accepts a normal BTC -> ETH swap', () => {
      expect(valid('0.5').ok).toBe(true);
    });

    it('accepts ETH -> DAI', () => {
      const result = validateSwap({
        fromId: 'ethereum',
        toId: 'dai',
        fromAmount: '1',
        holdings: HOLDINGS,
        prices: PRICES,
      });
      expect(result.ok).toBe(true);
    });

    it('accepts a stablecoin -> BTC swap', () => {
      const result = validateSwap({
        fromId: 'tether',
        toId: 'bitcoin',
        fromAmount: '100',
        holdings: HOLDINGS,
        prices: PRICES,
      });
      expect(result.ok).toBe(true);
    });
  });

  describe('error priority ordering', () => {
    it('INVALID_AMOUNT before SAME_ASSET', () => {
      const result = validateSwap({
        fromId: 'bitcoin',
        toId: 'bitcoin',
        fromAmount: '0',
        holdings: HOLDINGS,
        prices: PRICES,
      });
      expect((result as { ok: false; error: string }).error).toBe(
        'INVALID_AMOUNT',
      );
    });

    it('SAME_ASSET before MISSING_PRICE', () => {
      const result = validateSwap({
        fromId: 'bitcoin',
        toId: 'bitcoin',
        fromAmount: '1',
        holdings: HOLDINGS,
        prices: {},
      });
      expect((result as { ok: false; error: string }).error).toBe('SAME_ASSET');
    });

    it('MISSING_PRICE before BELOW_MINIMUM', () => {
      const result = validateSwap({
        fromId: 'bitcoin',
        toId: 'ethereum',
        fromAmount: '0.000001',
        holdings: HOLDINGS,
        prices: {},
      });
      expect((result as { ok: false; error: string }).error).toBe(
        'MISSING_PRICE',
      );
    });

    it('BELOW_MINIMUM before INSUFFICIENT_FUNDS', () => {
      // Amount is tiny (below 1 USD) AND above balance
      const result = validateSwap({
        fromId: 'bitcoin',
        toId: 'ethereum',
        fromAmount: '0.000001',
        holdings: { bitcoin: 0 },
        prices: PRICES,
      });
      expect((result as { ok: false; error: string }).error).toBe(
        'BELOW_MINIMUM',
      );
    });
  });
});
