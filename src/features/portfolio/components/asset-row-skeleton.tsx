import { View } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';

export function AssetRowSkeleton() {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </View>
      <View className="items-end gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-12" />
      </View>
    </View>
  );
}
