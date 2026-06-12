import { useRouter } from 'expo-router';
import { ArrowDownUp, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import {
  formatAmount,
  formatUsd,
  MASKED_AMOUNT,
  usePrivacyStore,
  type CoinId,
} from '@/features/shared';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

import { type SwapSideAsset } from './hooks/use-swap-assets';
import { useSwapForm } from './hooks/use-swap-form';
import { flipPair } from './store';
import { MIN_SWAP_USD, type SwapValidationError } from './validate-swap';

// Literal key map keeps t() calls statically typed (no template-literal keys).
const ERROR_KEYS = {
  INVALID_AMOUNT: 'swap.errors.invalidAmount',
  SAME_ASSET: 'swap.errors.sameAsset',
  INSUFFICIENT_FUNDS: 'swap.errors.insufficientFunds',
  BELOW_MINIMUM: 'swap.errors.belowMinimum',
  MISSING_PRICE: 'swap.errors.missingPrice',
} as const satisfies Record<SwapValidationError, string>;

interface SwapScreenProps {
  /** Deep-link param: `/swap?from=<coinId>` (coin detail's Convert CTA). */
  from?: CoinId;
}

export function SwapScreen({ from: initialFromId }: SwapScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { colors } = useTheme();
  const hideAmounts = usePrivacyStore((state) => state.hideAmounts);
  const router = useRouter();
  const form = useSwapForm(initialFromId);
  const [fromFocused, setFromFocused] = useState(false);

  // Arrow rolls half a turn per tap, accumulating (180 → 360 → 540…).
  const rotation = useSharedValue(0);
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const handleFlip = () => {
    rotation.value = withTiming(rotation.value + 180, { duration: 250 });
    flipPair();
  };

  const openPicker = (side: 'from' | 'to') =>
    router.push({ pathname: '/asset-picker', params: { side } });

  const balanceLabel = (asset: SwapSideAsset) =>
    hideAmounts
      ? `${MASKED_AMOUNT} ${asset.symbol}`
      : `${formatAmount(asset.balance, 8, locale)} ${asset.symbol}`;

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView
          className="px-6"
          contentContainerClassName="gap-4 pb-6 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="h3">{t('swap.title')}</Text>

          <View>
            <View
              style={{
                borderColor: fromFocused ? colors.primary : colors.border,
              }}
              className="rounded-3xl border-2 bg-surface p-5 pb-6"
            >
              <View className="flex-row items-center gap-3">
                <TextInput
                  autoFocus
                  className="flex-1 text-4xl font-semibold text-text"
                  value={form.amount}
                  onChangeText={form.setAmount}
                  onFocus={() => setFromFocused(true)}
                  onBlur={() => setFromFocused(false)}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                  accessibilityLabel={t('swap.amount')}
                />
                <AssetTrigger
                  asset={form.from}
                  onPress={() => openPicker('from')}
                />
              </View>
              <View className="mt-5 flex-row items-center justify-between">
                <Text variant="muted">
                  {t('swap.balance')}: {balanceLabel(form.from)}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('swap.max')}
                  hitSlop={8}
                  onPress={form.setMax}
                  className="rounded-xl bg-surface-muted px-3 py-2 active:opacity-80"
                >
                  <Text className="text-sm font-semibold">{t('swap.max')}</Text>
                </Pressable>
              </View>
            </View>

            {/* Zero net height: the button straddles the seam between cards. */}
            <View className="z-10 -my-6 items-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('swap.flip')}
                hitSlop={8}
                onPress={handleFlip}
                className="h-12 w-12 items-center justify-center rounded-full border-4 border-background bg-surface-muted active:opacity-80"
              >
                <Animated.View style={arrowStyle}>
                  <ArrowDownUp size={18} color={colors.text} />
                </Animated.View>
              </Pressable>
            </View>

            <View className="rounded-3xl bg-surface-muted p-5 py-7">
              <View className="flex-row items-center gap-3">
                <Text
                  className={
                    form.quote
                      ? 'flex-1 text-4xl font-semibold'
                      : 'flex-1 text-4xl font-semibold text-text-muted'
                  }
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {form.quote
                    ? formatAmount(form.quote.toAmount.toNumber(), 8, locale)
                    : '0'}
                </Text>
                <AssetTrigger
                  asset={form.to}
                  className="bg-surface"
                  onPress={() => openPicker('to')}
                />
              </View>
            </View>
          </View>

          {form.quote && (
            <View className="gap-2 rounded-2xl border border-border bg-surface p-4">
              <View className="flex-row items-center justify-between">
                <Text variant="muted">{t('swap.rate')}</Text>
                <Text className="font-semibold">
                  1 {form.from.symbol} ≈{' '}
                  {formatAmount(form.quote.rate.toNumber(), 8, locale)}{' '}
                  {form.to.symbol}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text variant="muted">{t('swap.value')}</Text>
                <Text className="font-semibold">
                  {formatUsd(form.quote.usdValue, locale)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text variant="muted">{t('swap.fee')}</Text>
                <Text className="font-semibold">
                  {formatUsd(form.quote.feeUsd, locale)}
                </Text>
              </View>
            </View>
          )}

          {form.errorCode && (
            <Text className="text-center text-danger">
              {t(ERROR_KEYS[form.errorCode], {
                min: formatUsd(MIN_SWAP_USD, locale),
              })}
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('swap.confirm')}
            accessibilityState={{ disabled: !form.canSubmit }}
            disabled={!form.canSubmit}
            onPress={form.submit}
            style={{
              backgroundColor: colors.primary,
              opacity: form.canSubmit ? 1 : 0.5,
            }}
            className="items-center rounded-2xl py-4 active:opacity-90"
          >
            <Text
              style={{ color: colors.primaryForeground }}
              className="text-lg font-semibold"
            >
              {t('swap.confirm')}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function AssetTrigger({
  asset,
  onPress,
  className,
}: {
  asset: SwapSideAsset;
  onPress: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t('swap.selectAsset')}: ${asset.name}`}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-2 rounded-full bg-surface-muted py-2 pl-2 pr-3 active:opacity-80',
        className,
      )}
    >
      <Image source={asset.image} className="h-7 w-7 rounded-full" />
      <Text className="font-semibold">{asset.symbol}</Text>
      <ChevronDown size={16} color={colors.textMuted} />
    </Pressable>
  );
}
