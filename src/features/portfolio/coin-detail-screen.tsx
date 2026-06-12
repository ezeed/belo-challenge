import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { PriceCard, PriceChart, useCoinMarket } from '@/features/coins';
import {
  formatAmount,
  formatUsd,
  getAsset,
  MASKED_AMOUNT,
  usePrivacyStore,
  valueAsset,
  type CoinId,
} from '@/features/shared';
import { useTheme } from '@/lib/theme';

import { usePortfolioStore } from './store';

interface CoinDetailScreenProps {
  id: CoinId;
}

/**
 * Portfolio drill-down for one coin: market price card (mid + spread pair),
 * 24h high/low, chart area (T13), your balance, conditional Convert CTA.
 * Lives in `portfolio` (not `coins`) to keep the feature graph acyclic.
 */
export function CoinDetailScreen({ id }: CoinDetailScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { colors } = useTheme();
  const router = useRouter();
  const asset = getAsset(id);
  const { coin, isPending } = useCoinMarket(id);
  const amount = usePortfolioStore((state) => state.holdings[id] ?? 0);
  const hideAmounts = usePrivacyStore((state) => state.hideAmounts);

  const title = asset?.name ?? id;

  if (!isPending && !coin) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ title }} />
        <Text className="text-text-muted">{t('coin.notFound')}</Text>
      </View>
    );
  }

  const balance = hideAmounts
    ? `${MASKED_AMOUNT} ${asset?.symbol ?? ''}`
    : `${formatAmount(amount, 8, locale)} ${asset?.symbol ?? ''}`;
  const balanceUsd = hideAmounts
    ? MASKED_AMOUNT
    : formatUsd(valueAsset(amount, coin?.current_price), locale);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-6"
    >
      <Stack.Screen options={{ title }} />

      {isPending || !coin ? (
        <>
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </>
      ) : (
        <>
          <PriceCard
            symbol={coin.symbol}
            image={coin.image}
            price={coin.current_price}
            changePct24h={coin.price_change_percentage_24h}
          />

          <View className="flex-row rounded-2xl border border-border bg-surface p-4">
            <View className="flex-1 gap-0.5">
              <Text variant="muted">{t('coin.max24h')}</Text>
              <Text className="font-semibold">
                {formatUsd(coin.high_24h, locale)}
              </Text>
            </View>
            <View className="flex-1 items-end gap-0.5">
              <Text variant="muted">{t('coin.min24h')}</Text>
              <Text className="font-semibold">
                {formatUsd(coin.low_24h, locale)}
              </Text>
            </View>
          </View>

          <PriceChart
            id={id}
            isUp={(coin.price_change_percentage_24h ?? 0) >= 0}
          />

          <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface p-4">
            <Text variant="muted">{t('coin.yourBalance')}</Text>
            <View className="items-end gap-0.5">
              <Text className="font-semibold">{balance}</Text>
              <Text variant="muted">{balanceUsd}</Text>
            </View>
          </View>

          {amount > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('coin.convert')}
              onPress={() =>
                router.push({ pathname: '/swap', params: { from: id } })
              }
              style={{ backgroundColor: colors.primary }}
              className="items-center rounded-2xl py-4 active:opacity-90"
            >
              <Text
                style={{ color: colors.primaryForeground }}
                className="text-lg font-semibold"
              >
                {t('coin.convert')}
              </Text>
            </Pressable>
          )}
        </>
      )}
    </ScrollView>
  );
}
