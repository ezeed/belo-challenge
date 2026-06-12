import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import {
  formatAmount,
  MASKED_AMOUNT,
  usePrivacyStore,
} from '@/features/shared';
import { useTheme } from '@/lib/theme';

import { useSwapAssets } from '../hooks/use-swap-assets';
import { selectFromAsset, selectToAsset, useSwapPairStore } from '../store';

interface AssetPickerSheetProps {
  side: 'from' | 'to';
}

/**
 * Content of the `asset-picker` route — native formSheet on iOS, modal on
 * Android (options in the root layout). Selection writes to the swap pair
 * store and dismisses; no callbacks cross the route boundary.
 */
export function AssetPickerSheet({ side }: AssetPickerSheetProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { colors } = useTheme();
  const router = useRouter();
  const assets = useSwapAssets();
  const selectedId = useSwapPairStore((state) =>
    side === 'to' ? state.toId : state.fromId,
  );
  const hideAmounts = usePrivacyStore((state) => state.hideAmounts);

  const select = (id: string) => {
    (side === 'to' ? selectToAsset : selectFromAsset)(id);
    router.back();
  };

  return (
    <View className="flex-1 gap-2 bg-background p-6 pt-8">
      <Text variant="h4" className="pb-2">
        {t('swap.selectAsset')}
      </Text>
      {assets.map((asset) => {
        const selected = asset.id === selectedId;
        const balance = hideAmounts
          ? `${MASKED_AMOUNT} ${asset.symbol}`
          : `${formatAmount(asset.balance, 8, locale)} ${asset.symbol}`;
        return (
          <Pressable
            key={asset.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${asset.name}, ${balance}`}
            onPress={() => select(asset.id)}
            style={
              selected
                ? {
                    borderColor: colors.primary,
                    backgroundColor: `${colors.primary}1F`,
                  }
                : undefined
            }
            className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4 active:opacity-80"
          >
            <Image source={asset.image} className="h-10 w-10 rounded-full" />
            <View className="flex-1 gap-0.5">
              <Text className="font-semibold">{asset.name}</Text>
              <Text variant="muted">{asset.symbol}</Text>
            </View>
            <Text variant="muted">{balance}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
