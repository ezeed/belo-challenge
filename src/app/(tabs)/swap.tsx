import { useLocalSearchParams } from 'expo-router';

import { SwapScreen } from '@/features/swap';

export default function SwapRoute() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  return <SwapScreen from={from} />;
}
