import * as Haptics from 'expo-haptics';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-wagmi-charts';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { formatUsd, type CoinId } from '@/features/shared';
import { useTheme } from '@/lib/theme';

import { useMarketChart } from '../hooks/use-market-chart';

const { width: screenWidth } = Dimensions.get('window');
const CHART_HEIGHT = 220;
const HORIZONTAL_PADDING = 24;
const CHART_WIDTH = screenWidth - HORIZONTAL_PADDING * 2;

interface PriceChartProps {
  id: CoinId;
  /** Based on price_change_percentage_24h — same source as the % badge. */
  isUp: boolean;
}

/**
 * Interactive 24h price chart: gradient fill, always-visible max/mid/min
 * y-axis labels (JS side — locale-aware), scrub-to-inspect crosshair with
 * haptics. PriceText/DatetimeText must live inside LineChart.Provider.
 */
export function PriceChart({ id, isUp }: PriceChartProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { data, isPending, isError } = useMarketChart(id);
  const { colors } = useTheme();
  const lineColor = isUp ? colors.chartUp : colors.chartDown;

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

  if (isPending) {
    return <Skeleton className="h-56 rounded-2xl" />;
  }

  if (isError || !data || !axis) {
    return (
      <View className="h-56 items-center justify-center rounded-2xl border border-border bg-surface">
        <Text variant="muted" className="text-sm">
          {t('coin.chartUnavailable')}
        </Text>
      </View>
    );
  }

  return (
    <View className="rounded-2xl border border-border bg-surface pb-2">
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
            options={{ hour: '2-digit', minute: '2-digit', hour12: false }}
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
