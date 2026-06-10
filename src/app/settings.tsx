import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

/** Placeholder — settings (language / theme / mock mode) lands in T18. */
export default function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-text-muted">{t('common.comingSoon')}</Text>
    </View>
  );
}
