import { Eye, EyeOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import {
  formatUsd,
  MASKED_AMOUNT,
  toggleHideAmounts,
  usePrivacyStore,
} from '@/features/shared';
import { useTheme } from '@/lib/theme';

interface BalanceCardProps {
  totalUsd: string;
  isLoading: boolean;
}

export function BalanceCard({ totalUsd, isLoading }: BalanceCardProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const hideAmounts = usePrivacyStore((state) => state.hideAmounts);
  const EyeIcon = hideAmounts ? EyeOff : Eye;

  return (
    <View className="gap-1 rounded-2xl border border-border bg-surface px-5 py-8">
      <View className="flex-row items-center justify-between">
        <Text variant="muted">{t('portfolio.totalBalance')}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(
            hideAmounts ? 'portfolio.showAmounts' : 'portfolio.hideAmounts',
          )}
          hitSlop={8}
          onPress={toggleHideAmounts}
          className="h-12 w-12 items-center justify-center rounded-full bg-surface-muted active:opacity-80"
        >
          <EyeIcon size={24} color={colors.textMuted} />
        </Pressable>
      </View>
      {isLoading ? (
        <Skeleton className="h-10 w-44" />
      ) : (
        <Text className="text-4xl font-bold">
          {hideAmounts ? MASKED_AMOUNT : formatUsd(totalUsd, i18n.language)}
        </Text>
      )}
    </View>
  );
}
