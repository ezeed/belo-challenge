import { Big } from 'big.js';

export type Numeric = number | string | Big;

/** All money math goes through Big — construct from string when precision matters. */
export function big(value: Numeric): Big {
  return new Big(value);
}

export function formatUsd(value: Numeric, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  }).format(big(value).toNumber());
}

/** Crypto amounts: up to `maxDecimals` fraction digits, no trailing zeros. */
export function formatAmount(
  value: Numeric,
  maxDecimals = 8,
  locale?: string,
): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: maxDecimals,
  }).format(big(value).toNumber());
}

/** Percentage points (e.g. 2.4 → "+2.4%"). */
export function formatPercent(value: Numeric, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero',
  }).format(big(value).div(100).toNumber());
}

/** Localized timestamp for history rows (e.g. "Jun 12, 2026, 2:30 PM"). */
export function formatDateTime(timestampMs: number, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestampMs);
}
