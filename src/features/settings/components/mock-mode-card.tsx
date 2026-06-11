import { useTranslation } from 'react-i18next';
import { Switch, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { hasApiKey, setMockMode, useMockActive } from '@/lib/api';
import { queryClient } from '@/lib/query';
import { useTheme } from '@/lib/theme';

export function MockModeCard() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const keyless = !hasApiKey();
  const mockActive = useMockActive();

  const onToggle = (enabled: boolean) => {
    setMockMode(enabled);
    // repository swapped → refetch everything from the new source
    void queryClient.invalidateQueries();
  };

  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface p-4">
      <View className="flex-1 gap-0.5 pr-3">
        <Text className="font-semibold">{t('settings.mockMode')}</Text>
        <Text variant="muted">
          {keyless ? t('settings.mockModeNoKey') : t('settings.mockModeHint')}
        </Text>
      </View>
      <Switch
        accessibilityLabel={t('settings.mockMode')}
        value={mockActive}
        disabled={keyless}
        onValueChange={onToggle}
        trackColor={{ true: colors.primary }}
      />
    </View>
  );
}
