import { sanitizeAmountInput } from './sanitize-amount';

describe('sanitizeAmountInput', () => {
  it('passes plain decimal input through', () => {
    expect(sanitizeAmountInput('123.45')).toBe('123.45');
  });

  it('normalizes a comma separator to a dot', () => {
    expect(sanitizeAmountInput('0,5')).toBe('0.5');
  });

  it('keeps only the first decimal separator', () => {
    expect(sanitizeAmountInput('1.2.3')).toBe('1.23');
    expect(sanitizeAmountInput('1,2,3')).toBe('1.23');
    expect(sanitizeAmountInput('1.2,3')).toBe('1.23');
  });

  it('strips signs, exponents and other non-numeric characters', () => {
    expect(sanitizeAmountInput('-1.5e3')).toBe('1.53');
    expect(sanitizeAmountInput('1 000')).toBe('1000');
    expect(sanitizeAmountInput('$42')).toBe('42');
  });

  it('allows a leading separator (".5" is valid big.js input)', () => {
    expect(sanitizeAmountInput('.5')).toBe('.5');
  });

  it('returns empty for empty or fully invalid input', () => {
    expect(sanitizeAmountInput('')).toBe('');
    expect(sanitizeAmountInput('abc')).toBe('');
  });
});
