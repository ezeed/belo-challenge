import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Transaction } from '@/features/shared';
import { zustandStorage } from '@/lib/storage';

export interface AppNotification {
  id: string;
  /** Unix epoch in milliseconds. */
  createdAt: number;
  kind: 'swap';
  /** Cleared when the user leaves the notifications screen. */
  read: boolean;
  /** Snapshot — history renders without joins even after a portfolio reset. */
  transaction: Transaction;
}

interface NotificationsState {
  notifications: AppNotification[];
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    () => ({
      notifications: [] as AppNotification[],
    }),
    {
      name: 'notifications',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

/** Newest first; arrives unread. */
export function addNotification(
  notification: Omit<AppNotification, 'read'>,
): void {
  useNotificationsStore.setState((state) => ({
    notifications: [{ ...notification, read: false }, ...state.notifications],
  }));
}

/** Tap-to-read: flips one notification; no-op when already read. */
export function markRead(id: string): void {
  useNotificationsStore.setState((state) =>
    state.notifications.some(
      (notification) => notification.id === id && !notification.read,
    )
      ? {
          notifications: state.notifications.map((notification) =>
            notification.id === id && !notification.read
              ? { ...notification, read: true }
              : notification,
          ),
        }
      : state,
  );
}

export function markAllRead(): void {
  useNotificationsStore.setState((state) =>
    state.notifications.some((notification) => !notification.read)
      ? {
          notifications: state.notifications.map((notification) =>
            notification.read ? notification : { ...notification, read: true },
          ),
        }
      : state,
  );
}

export function clearNotifications(): void {
  useNotificationsStore.setState({ notifications: [] });
}

/** Reactive badge count — primitive return keeps subscribers cheap. */
export function useUnreadCount(): number {
  return useNotificationsStore((state) =>
    state.notifications.reduce(
      (count, notification) => (notification.read ? count : count + 1),
      0,
    ),
  );
}
