import { memo, useMemo } from 'react';
import Svg, { Polyline } from 'react-native-svg';

import { useTheme } from '@/lib/theme';

import { sparklinePoints } from './sparkline-points';

interface SparklineProps {
  prices: number[];
  /** Trailing points to render. Hourly series → 24 = a 24h window, matching the row's 24h %. */
  lastN?: number;
  width?: number;
  height?: number;
}

/** Stablecoin-sized ranges (< 0.5% of price) render near-flat instead of full-height. */
const MIN_RANGE_RATIO = 0.005;

/**
 * Hand-rolled row sparkline — deliberately not a chart-lib component
 * (one chart instance per list row is a perf footgun). Memoized: `prices`
 * is reference-stable between query refetches.
 */
export const Sparkline = memo(function Sparkline({
  prices,
  lastN = 24,
  width = 64,
  height = 24,
}: SparklineProps) {
  const { colors } = useTheme();

  const { points, isUp } = useMemo(() => {
    const series = prices.slice(-lastN);
    return {
      points: sparklinePoints(series, width, height, 1, MIN_RANGE_RATIO),
      isUp: series.length > 1 && series[series.length - 1] >= series[0],
    };
  }, [prices, lastN, width, height]);

  if (!points) return null;

  return (
    <Svg width={width} height={height} pointerEvents="none" accessible={false}>
      <Polyline
        points={points}
        fill="none"
        stroke={isUp ? colors.chartUp : colors.chartDown}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
});
