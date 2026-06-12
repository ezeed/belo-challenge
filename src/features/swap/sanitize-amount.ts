/**
 * Keyboard sanitizer for the swap amount field.
 *
 * Keeps digits and at most one decimal separator; "," normalizes to "."
 * (es-locale decimal pads type a comma). Output is always parseable by
 * big.js or empty — validation handles the rest ("", ".", "0").
 */
export function sanitizeAmountInput(raw: string): string {
  const stripped = raw.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const [integer, ...fraction] = stripped.split('.');
  return fraction.length > 0 ? `${integer}.${fraction.join('')}` : integer;
}
