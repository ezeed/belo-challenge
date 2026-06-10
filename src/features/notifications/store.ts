import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Transaction } from '@/features/shared';
import { zustandStorage } from '@/lib/storage';

export interface AppNotification {
  id: string;
  /** Unix epoch in milliseconds. */
  createdAt: number;
  kind: 'swap';
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
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

/** Newest first. */
export function addNotification(notification: AppNotification): void {
  useNotificationsStore.setState((state) => ({
    notifications: [notification, ...state.notifications],
  }));
}

export function clearNotifications(): void {
  useNotificationsStore.setState({ notifications: [] });
}
