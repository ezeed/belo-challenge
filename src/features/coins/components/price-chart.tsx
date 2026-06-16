import * as Haptics from 'expo-haptics';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-wagmi-charts';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { formatUsd, type CoinId } from '@/features/shared';
import type { ChartDays } from '@/lib/api';
import { useTheme } from '@/lib/theme';

import { useMarketChart } from '../hooks/use-market-chart';

const { width: screenWidth } = Dimensions.get('window');
const CHART_HEIGHT = 220;
const HORIZONTAL_PADDING = 24;
const CHART_WIDTH = screenWidth - HORIZONTAL_PADDING * 2;

/** Literal keys keep `t()` statically typed (same pattern as swap.errors). */
const RANGES = [
  { days: 1, key: 'coin.range1d' },
  { days: 7, key: 'coin.range7d' },
  { days: 30, key: 'coin.range1m' },
  { days: 365, key: 'coin.range1y' },
] as const satisfies readonly { days: ChartDays; key: string }[];

/** Scrub timestamp detail matches the range's granularity. */
const DATETIME_OPTIONS: Record<ChartDays, Intl.DateTimeFormatOptions> = {
  1: { hour: '2-digit', minute: '2-digit', hour12: false },
  7: {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
  30: {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
  365: { year: 'numeric', month: 'short', day: 'numeric' },
};

interface PriceChartProps {
  id: CoinId;
  /** Based on price_change_percentage_24h — same source as the % badge. */
  isUp: boolean;
}

/**
 * Interactive price chart with a 1D/7D/1M/1Y range selector: gradient fill,
 * always-visible max/mid/min y-axis labels (JS side — locale-aware),
 * scrub-to-inspect crosshair with haptics. PriceText/DatetimeText must live
 * inside LineChart.Provider.
 *
 * Direction color: 1D uses the `isUp` prop (the same value as the % badge,
 * per the sparkline rule); longer ranges derive it from the series endpoints
 * — the 24h % says nothing about a week or a year.
 */
export function PriceChart({ id, isUp }: PriceChartProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [days, setDays] = useState<ChartDays>(1);
  const { data, isPending, isError } = useMarketChart(id, days);
  const { colors } = useTheme();

  const handleActivated = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const chartData = useMemo(
    () =>
      (data?.prices ?? []).map(([timestamp, value]) => ({ timestamp, value })),
    [data],
  );

  // Y-axis guide labels: series max / mid / min, rendered as overlays.
  const axis = useMemo(() => {
    if (chartData.length === 0) return undefined;
    let min = chartData[0].value;
    let max = chartData[0].value;
    for (const point of chartData) {
      if (point.value < min) min = point.value;
      if (point.value > max) max = point.value;
    }
    return { max, mid: (max + min) / 2, min };
  }, [chartData]);

  const seriesUp =
    chartData.length > 1
      ? chartData[chartData.length - 1].value >= chartData[0].value
      : isUp;
  const lineColor = (days === 1 ? isUp : seriesUp)
    ? colors.chartUp
    : colors.chartDown;

  const showChart = !isPending && !isError && data && axis;

  return (
    <View className="rounded-2xl border border-border bg-surface pb-2">
      {isPending ? (
        <View className="p-2">
          <Skeleton className="h-56 rounded-xl" />
        </View>
      ) : !showChart ? (
        <View className="h-56 items-center justify-center">
          <Text variant="muted" className="text-sm">
            {t('coin.chartUnavailable')}
          </Text>
        </View>
      ) : (
        <LineChart.Provider data={chartData}>
          {/* Price + datetime header — updates live while scrubbing crosshair */}
          <View className="flex-row items-baseline justify-between px-4 pb-1 pt-3">
            <LineChart.PriceText
              format={({ value }) => {
                // Runs as a Reanimated worklet on the UI thread: no Intl/i18n
                // available, so USD is formatted manually (documented trade-off).
                'worklet';
                if (!value) return '';
                const fixed = Number(value).toFixed(2);
                return `$${fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              }}
              style={[styles.priceText, { color: colors.text }]}
            />
            <LineChart.DatetimeText
              options={DATETIME_OPTIONS[days]}
              style={[styles.datetimeText, { color: colors.textMuted }]}
            />
          </View>

          <View>
            <LineChart
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              style={styles.chart}
            >
              <LineChart.Path color={lineColor}>
                <LineChart.Gradient color={lineColor} />
              </LineChart.Path>
              <LineChart.CursorCrosshair
                color={lineColor}
                onActivated={handleActivated}
              />
            </LineChart>

            {/* Always-visible y-axis guides (locale-aware — not worklets) */}
            <View pointerEvents="none" style={styles.axisOverlay}>
              <Text variant="muted" className="text-xs">
                {formatUsd(axis.max, locale)}
              </Text>
              <Text variant="muted" className="text-xs">
                {formatUsd(axis.mid, locale)}
              </Text>
              <Text variant="muted" className="text-xs">
                {formatUsd(axis.min, locale)}
              </Text>
            </View>
          </View>
        </LineChart.Provider>
      )}

      {/* Range selector — stays visible in error state so users can switch back */}
      <View className="flex-row justify-between px-4 pb-1 pt-2">
        {RANGES.map((range) => {
          const selected = range.days === days;
          return (
            <Pressable
              key={range.days}
              accessibilityRole="button"
              accessibilityLabel={t(range.key)}
              accessibilityState={{ selected }}
              onPress={() => setDays(range.days)}
              // Selected tint needs the brand color — inline style per theming rule
              style={
                selected
                  ? { backgroundColor: `${colors.primary}1F` }
                  : undefined
              }
              className="min-w-14 items-center rounded-full px-3 py-1.5 active:opacity-70"
            >
              <Text
                style={selected ? { color: colors.primary } : undefined}
                variant={selected ? undefined : 'muted'}
                className="text-xs font-semibold"
              >
                {t(range.key)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    alignSelf: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
  },
  datetimeText: {
    fontSize: 13,
  },
  axisOverlay: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    right: 8,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
});
