import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

/** Placeholder — coin detail screen lands in T12. */
export default function CoinDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text variant="h3" className="mb-2">
        {id}
      </Text>
      <Text className="text-text-muted">{t('common.comingSoon')}</Text>
    </View>
  );
}
