import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

/** Placeholder — notifications history screen lands in T17. */
export default function NotificationsScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-text-muted">{t('common.comingSoon')}</Text>
    </View>
  );
}
