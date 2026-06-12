import { useLocalSearchParams } from 'expo-router';

import { AssetPickerSheet } from '@/features/swap';

export default function AssetPickerRoute() {
  const { side } = useLocalSearchParams<{ side?: string }>();
  return <AssetPickerSheet side={side === 'to' ? 'to' : 'from'} />;
}
