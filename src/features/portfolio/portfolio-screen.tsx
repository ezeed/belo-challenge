import { ArrowDownWideNarrow, ArrowUpNarrowWide, Bell } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Pressable,
  RefreshControl,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';

import { Text } from '@/components/ui/text';
import { useMockActive } from '@/lib/api';
import { useTheme } from '@/lib/theme';

import { AssetRowSkeleton } from './components/asset-row-skeleton';
import { AssetRow } from './components/asset-row';
import { BalanceCard } from './components/balance-card';
import {
  usePortfolio,
  type PortfolioRow,
  type SortDirection,
} from './hooks/use-portfolio';

const SKELETON_ROWS = [0, 1, 2, 3, 4];

export function PortfolioScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const [sort, setSort] = useState<SortDirection>('desc');
  const { rows, totalUsd, isPending, isRefreshing, refresh } =
    usePortfolio(sort);
  const mockActive = useMockActive();

  const isDesc = sort === 'desc';
  const SortIcon = isDesc ? ArrowDownWideNarrow : ArrowUpNarrowWide;

  const renderItem: ListRenderItem<PortfolioRow> = useCallback(
    ({ item }) => (
      <AssetRow
        name={item.name}
        symbol={item.symbol}
        image={item.image}
        amount={item.amount}
        valueUsd={item.valueUsd}
        changePct24h={item.changePct24h}
        sparkline7d={item.sparkline7d}
      />
    ),
    [],
  );

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="flex-1">
        <FlatList
          data={isPending ? [] : rows}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          className="px-6"
          contentContainerClassName="gap-3 pb-6"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.textMuted}
            />
          }
          ListHeaderComponent={
            <View className="gap-4 pb-1 pt-4">
              <View className="flex-row items-center justify-between">
                <Text variant="h3">{t('portfolio.title')}</Text>
                <View className="flex-row items-center gap-2">
                  {mockActive && (
                    <View
                      style={{ backgroundColor: `${colors.primary}1F` }}
                      className="rounded-full px-3 py-1"
                    >
                      <Text variant="muted" style={{ color: colors.primary }}>
                        {t('common.mockBadge')}
                      </Text>
                    </View>
                  )}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('portfolio.notifications')}
                    hitSlop={8}
                    onPress={() => router.push('/notifications')}
                    className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted active:opacity-80"
                  >
                    <Bell size={18} color={colors.text} />
                  </Pressable>
                </View>
              </View>
              <BalanceCard totalUsd={totalUsd} isLoading={isPending} />
              <View className="flex-row items-center justify-between">
                <Text variant="large">{t('portfolio.assets')}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('portfolio.sortByValue')}
                  accessibilityValue={{
                    text: t(
                      isDesc ? 'portfolio.descending' : 'portfolio.ascending',
                    ),
                  }}
                  hitSlop={8}
                  onPress={() => setSort(isDesc ? 'asc' : 'desc')}
                  className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted active:opacity-80"
                >
                  <SortIcon size={18} color={colors.text} />
                </Pressable>
              </View>
              {isPending && (
                <View className="gap-3">
                  {SKELETON_ROWS.map((index) => (
                    <AssetRowSkeleton key={index} />
                  ))}
                </View>
              )}
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}
