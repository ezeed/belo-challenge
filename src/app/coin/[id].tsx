import { useLocalSearchParams } from 'expo-router';

import { CoinDetailScreen } from '@/features/portfolio';

export default function CoinDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CoinDetailScreen id={id} />;
}
