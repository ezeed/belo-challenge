/**
 * Normalize a price series into an SVG polyline `points` string filling the
 * given view box. Display-only math — no money precision requirements.
 *
 * `minRangeRatio` sets a range floor relative to the price level: series whose
 * range is below it (stablecoins) render compressed around the midline instead
 * of amplified to full height.
 */
export function sparklinePoints(
  prices: number[],
  width: number,
  height: number,
  padding = 1,
  minRangeRatio = 0,
): string {
  if (prices.length < 2) return '';

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const center = (min + max) / 2;
  const range = Math.max(max - min, minRangeRatio * center);
  const innerHeight = height - padding * 2;
  const stepX = width / (prices.length - 1);

  return prices
    .map((price, index) => {
      const x = index * stepX;
      // flat series → horizontal midline
      const normalized = range === 0 ? 0.5 : 0.5 + (price - center) / range;
      const y = padding + (1 - normalized) * innerHeight;
      return `${round(x)},${round(y)}`;
    })
    .join(' ');
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
