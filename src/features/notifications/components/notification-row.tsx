import { ArrowDownUp } from 'lucide-react-native';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import {
  formatAmount,
  formatDateTime,
  formatUsd,
  MASKED_AMOUNT,
  usePrivacyStore,
} from '@/features/shared';
import { useTheme } from '@/lib/theme';

interface NotificationRowProps {
  fromAmount: number;
  fromSymbol: string;
  toAmount: number;
  toSymbol: string;
  usdValue: number;
  timestamp: number;
}

/** Memoized: primitive props only — same contract as the portfolio rows. */
export const NotificationRow = memo(function NotificationRow({
  fromAmount,
  fromSymbol,
  toAmount,
  toSymbol,
  usdValue,
  timestamp,
}: NotificationRowProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { colors } = useTheme();
  const hideAmounts = usePrivacyStore((state) => state.hideAmounts);

  const from = hideAmounts
    ? `${MASKED_AMOUNT} ${fromSymbol}`
    : `${formatAmount(fromAmount, 8, locale)} ${fromSymbol}`;
  const to = hideAmounts
    ? `${MASKED_AMOUNT} ${toSymbol}`
    : `${formatAmount(toAmount, 8, locale)} ${toSymbol}`;
  const title = t('notifications.swapped', { from, to });
  const meta = `${hideAmounts ? MASKED_AMOUNT : formatUsd(usdValue, locale)} · ${formatDateTime(timestamp, locale)}`;

  return (
    <View
      accessibilityLabel={`${title}, ${meta}`}
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
        <ArrowDownUp size={18} color={colors.text} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="font-semibold">{title}</Text>
        <Text variant="muted">{meta}</Text>
      </View>
    </View>
  );
});
