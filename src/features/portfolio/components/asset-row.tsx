import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { formatAmount, formatPercent, formatUsd } from '@/features/shared';

interface AssetRowProps {
  name: string;
  symbol: string;
  image?: string;
  amount: number;
  valueUsd: string;
  changePct24h?: number;
  onPress?: () => void;
}

/** Memoized: primitive props only — rows skip re-render unless their data changes. */
export const AssetRow = memo(function AssetRow({
  name,
  symbol,
  image,
  amount,
  valueUsd,
  changePct24h,
  onPress,
}: AssetRowProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const holding = `${formatAmount(amount, 8, locale)} ${symbol}`;
  const value = formatUsd(valueUsd, locale);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${holding}, ${value}`}
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4 active:opacity-80"
    >
      <Image source={image} className="h-10 w-10 rounded-full" />
      <View className="flex-1 gap-0.5">
        <Text className="font-semibold">{name}</Text>
        <Text variant="muted">{holding}</Text>
      </View>
      <View className="items-end gap-0.5">
        <Text className="font-semibold">{value}</Text>
        {changePct24h !== undefined && (
          <Text
            className={
              changePct24h >= 0
                ? 'text-sm text-positive'
                : 'text-sm text-danger'
            }
          >
            {formatPercent(changePct24h, locale)}
          </Text>
        )}
      </View>
    </Pressable>
  );
});
