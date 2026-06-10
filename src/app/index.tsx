import { Moon, Sun } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/theme';

/**
 * Temporary token-demo screen (T02). Replaced by the Portfolio screen in T10.
 * Exercises every semantic token in both themes.
 */
export default function HomeScreen() {
  const { scheme, colors, setColorScheme } = useTheme();
  const { t } = useTranslation();
  const ToggleIcon = scheme === 'dark' ? Sun : Moon;

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1 items-stretch gap-4 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-text">
            {t('demo.title')}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('demo.toggleTheme')}
            onPress={() => setColorScheme(scheme === 'dark' ? 'light' : 'dark')}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted"
          >
            <ToggleIcon size={20} color={colors.text} />
          </Pressable>
        </View>

        <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
          <Text className="text-text">{t('demo.textOnSurface')}</Text>
          <Text className="text-text-muted">{t('demo.mutedText')}</Text>
          <View className="flex-row gap-2">
            <View className="rounded-full bg-positive-surface px-3 py-1">
              <Text className="text-positive">+2.4%</Text>
            </View>
            <View className="rounded-full bg-danger/10 px-3 py-1">
              <Text className="text-danger">-1.2%</Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          className="items-center rounded-2xl bg-primary p-4 active:opacity-80"
        >
          <Text className="font-semibold text-primary-foreground">
            {t('demo.primaryButton')}
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
