import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, View, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
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
  const [sort, setSort] = useState<SortDirection>('desc');
  const { rows, totalUsd, isPending } = usePortfolio(sort);

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
          ListHeaderComponent={
            <View className="gap-4 pb-1 pt-4">
              <Text variant="h3">{t('portfolio.title')}</Text>
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
