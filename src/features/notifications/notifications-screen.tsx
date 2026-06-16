import { Stack } from 'expo-router';
import { BellOff, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, View, type ListRenderItem } from 'react-native';

import { Text } from '@/components/ui/text';
import { getAsset } from '@/features/shared';
import { useTheme } from '@/lib/theme';

import { NotificationRow } from './components/notification-row';
import {
  clearNotifications,
  markAllRead,
  markRead,
  useNotificationsStore,
  type AppNotification,
} from './store';

/** Swap history (req. 4) — newest first; growable list, so virtualized. */
export function NotificationsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const notifications = useNotificationsStore((state) => state.notifications);

  // Mark read on unmount: unread dots stay visible while reading; the badge
  // clears once the user leaves. Zustand module action — not a React setState.
  useEffect(() => markAllRead, []);

  const renderItem: ListRenderItem<AppNotification> = useCallback(
    ({ item }) => (
      <NotificationRow
        id={item.id}
        fromAmount={item.transaction.fromAmount}
        fromSymbol={
          getAsset(item.transaction.fromId)?.symbol ?? item.transaction.fromId
        }
        toAmount={item.transaction.toAmount}
        toSymbol={
          getAsset(item.transaction.toId)?.symbol ?? item.transaction.toId
        }
        usdValue={item.transaction.usdValue}
        timestamp={item.createdAt}
        read={item.read}
        onPress={markRead}
      />
    ),
    [],
  );

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerRight:
            notifications.length > 0
              ? () => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('notifications.clearAll')}
                    hitSlop={8}
                    onPress={clearNotifications}
                    className="active:opacity-80"
                  >
                    <Trash2 size={20} color={colors.text} />
                  </Pressable>
                )
              : undefined,
        }}
      />
      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <BellOff size={32} color={colors.textMuted} />
          <Text variant="muted">{t('notifications.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          className="px-6"
          contentContainerClassName="gap-3 py-4"
        />
      )}
    </View>
  );
}
