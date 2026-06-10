import type { Transaction } from '@/features/shared';

import { applySwapToHoldings } from './apply-swap';

function makeTransaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: 'tx-1',
    timestamp: 0,
    fromId: 'tether',
    toId: 'bitcoin',
    fromAmount: 100,
    toAmount: 0.0016,
    usdValue: 100,
    rate: 0.000016,
    feeUsd: 0.5,
    ...overrides,
  };
}

describe('applySwapToHoldings', () => {
  it('debits the from-asset and credits the to-asset', () => {
    const result = applySwapToHoldings(
      { tether: 1000, bitcoin: 0.05 },
      makeTransaction({}),
    );
    expect(result.tether).toBe(900);
    expect(result.bitcoin).toBe(0.0516);
  });

  it('starts unknown to-assets from 0', () => {
    const result = applySwapToHoldings(
      { tether: 1000 },
      makeTransaction({ toId: 'ethereum', toAmount: 0.04 }),
    );
    expect(result.ethereum).toBe(0.04);
  });

  it('avoids binary float drift on the credit side', () => {
    const result = applySwapToHoldings(
      { tether: 0.3, dai: 0.1 },
      makeTransaction({
        fromId: 'tether',
        toId: 'dai',
        fromAmount: 0.1,
        toAmount: 0.2,
      }),
    );
    expect(result.tether).toBe(0.2);
    expect(result.dai).toBe(0.3);
  });

  it('does not touch other holdings', () => {
    const result = applySwapToHoldings(
      { tether: 1000, bitcoin: 0.05, ethereum: 1.5 },
      makeTransaction({}),
    );
    expect(result.ethereum).toBe(1.5);
  });
});
