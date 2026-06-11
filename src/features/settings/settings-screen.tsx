import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';

import { LanguageCard } from './components/language-card';
import { MockModeCard } from './components/mock-mode-card';
import { ThemeCard } from './components/theme-card';

export function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="flex-1 gap-4 px-6">
        <Text variant="h3" className="pt-4">
          {t('settings.title')}
        </Text>
        <MockModeCard />
        <ThemeCard />
        <LanguageCard />
      </SafeAreaView>
    </View>
  );
}
