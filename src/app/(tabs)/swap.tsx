import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

/** Placeholder — swap simulator lands in T15/T16, which consumes the `?from=<coinId>` param. */
export default function SwapScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-text-muted">{t('common.comingSoon')}</Text>
    </View>
  );
}
