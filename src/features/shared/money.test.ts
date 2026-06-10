import { big, formatAmount, formatPercent, formatUsd } from './money';

describe('big', () => {
  it('avoids float drift on addition', () => {
    expect(big('0.1').plus('0.2').toString()).toBe('0.3');
  });

  it('avoids float drift on multiplication', () => {
    expect(big('1000.01').times(3).toString()).toBe('3000.03');
  });

  it('preserves precision from string input', () => {
    expect(big('0.000000059').times('1e8').toString()).toBe('5.9');
  });

  it('accepts Big instances', () => {
    expect(big(big(2)).toNumber()).toBe(2);
  });

  it('throws on invalid input', () => {
    expect(() => big('not-a-number')).toThrow();
  });
});

describe('formatUsd', () => {
  it('formats USD with two decimals', () => {
    expect(formatUsd(5756.25, 'en-US')).toBe('$5,756.25');
  });

  it('accepts string input', () => {
    expect(formatUsd('1000', 'en-US')).toBe('$1,000.00');
  });

  it('localizes separators', () => {
    expect(formatUsd(1000, 'es-AR')).toContain('1.000,00');
  });
});

describe('formatAmount', () => {
  it('keeps crypto precision without trailing zeros', () => {
    expect(formatAmount(0.05, 8, 'en-US')).toBe('0.05');
    expect(formatAmount('0.00012345', 8, 'en-US')).toBe('0.00012345');
  });

  it('caps fraction digits', () => {
    expect(formatAmount('0.123456789', 4, 'en-US')).toBe('0.1235');
  });
});

describe('formatPercent', () => {
  it('shows sign except for zero', () => {
    expect(formatPercent(2.4, 'en-US')).toBe('+2.4%');
    expect(formatPercent(-1.2, 'en-US')).toBe('-1.2%');
    expect(formatPercent(0, 'en-US')).toBe('0%');
  });
});
