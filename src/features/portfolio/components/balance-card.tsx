import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { formatUsd } from '@/features/shared';

interface BalanceCardProps {
  totalUsd: string;
  isLoading: boolean;
}

export function BalanceCard({ totalUsd, isLoading }: BalanceCardProps) {
  const { t, i18n } = useTranslation();

  return (
    <View className="gap-1 rounded-2xl border border-border bg-surface px-5 py-8">
      <Text variant="muted">{t('portfolio.totalBalance')}</Text>
      {isLoading ? (
        <Skeleton className="h-10 w-44" />
      ) : (
        <Text className="text-4xl font-bold">
          {formatUsd(totalUsd, i18n.language)}
        </Text>
      )}
    </View>
  );
}
