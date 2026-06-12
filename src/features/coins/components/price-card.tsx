import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { formatPercent, formatUsd, spreadPair } from '@/features/shared';

interface PriceCardProps {
  symbol: string;
  image?: string;
  /** Mid price in USD. */
  price: number;
  changePct24h?: number;
}

/** Mockup price card: current (mid) price + 24h %, plus the Venta/Compra spread pair (challenge §Coin Details). */
export function PriceCard({
  symbol,
  image,
  price,
  changePct24h,
}: PriceCardProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { sell, buy } = spreadPair(String(price));

  return (
    <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
      <View className="flex-row items-center gap-2">
        <Image source={image} className="h-6 w-6 rounded-full" />
        <Text variant="muted" className="font-semibold">
          {/* CoinGecko symbols come lowercase; uppercase in JS, not CSS (stale-CSS dev issue) */}
          {symbol.toUpperCase()}
        </Text>
      </View>
      <View className="gap-0.5">
        <Text variant="muted">{t('coin.currentPrice')}</Text>
        <View className="flex-row items-end gap-2">
          <Text className="text-3xl font-bold">{formatUsd(price, locale)}</Text>
          {changePct24h !== undefined && (
            <Text
              className={
                changePct24h >= 0 ? 'pb-1 text-positive' : 'pb-1 text-danger'
              }
            >
              {formatPercent(changePct24h, locale)}
            </Text>
          )}
        </View>
      </View>
      <View className="flex-row border-t border-border pt-3">
        <View className="flex-1 gap-0.5">
          <Text variant="muted">{t('coin.sell')}</Text>
          <Text className="font-semibold">{formatUsd(sell, locale)}</Text>
        </View>
        <View className="flex-1 items-end gap-0.5">
          <Text variant="muted">{t('coin.buy')}</Text>
          <Text className="font-semibold">{formatUsd(buy, locale)}</Text>
        </View>
      </View>
    </View>
  );
}
