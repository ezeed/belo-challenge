import { useTranslation } from 'react-i18next';
import { Alert, Pressable } from 'react-native';
import { toast } from 'sonner-native';

import { Text } from '@/components/ui/text';
import { resetPortfolio } from '@/features/portfolio';
import { useTheme } from '@/lib/theme';

import { SettingCard } from './setting-card';

/**
 * Destructive action behind a native confirm dialog. Resets holdings to the
 * seed balances and drops the transaction history; notifications survive by
 * design (they snapshot their Transaction).
 */
export function ResetCard() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const confirmReset = () => {
    Alert.alert(
      t('settings.resetConfirmTitle'),
      t('settings.resetConfirmMessage'),
      [
        { text: t('settings.resetCancel'), style: 'cancel' },
        {
          text: t('settings.resetConfirm'),
          style: 'destructive',
          onPress: () => {
            resetPortfolio();
            toast.success(t('settings.resetDone'));
          },
        },
      ],
    );
  };

  return (
    <SettingCard title={t('settings.reset')}>
      <Text variant="muted">{t('settings.resetHint')}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('settings.reset')}
        onPress={confirmReset}
        style={{ borderColor: colors.danger }}
        className="items-center rounded-xl border py-3 active:opacity-80"
      >
        <Text className="font-semibold text-danger">{t('settings.reset')}</Text>
      </Pressable>
    </SettingCard>
  );
}
