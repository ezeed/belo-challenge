import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

/** Placeholder — swap simulator lands in T15/T16. */
export default function SwapScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-text-muted">{t('common.comingSoon')}</Text>
    </View>
  );
}
