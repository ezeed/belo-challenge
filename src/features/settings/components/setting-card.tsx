import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

interface SettingCardProps {
  title: string;
  children: ReactNode;
}

/** Titled surface card wrapping a single setting's control. */
export function SettingCard({ title, children }: SettingCardProps) {
  return (
    <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
      <Text className="font-semibold">{title}</Text>
      {children}
    </View>
  );
}
