import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';

import { useMarkets } from '@/features/coins';
import { usePortfolioStore } from '@/features/portfolio';
import { big, formatAmount, getAsset, type PriceMap } from '@/features/shared';

import { calculateSwap, type SwapCalculation } from '../calculate-swap';
import { sanitizeAmountInput } from '../sanitize-amount';
import { executeSwap } from '../swap-service';
import { selectFromAsset, useSwapPairStore } from '../store';
import {
  validateSwap,
  type SwapValidationError as SwapValidationErrorCode,
} from '../validate-swap';
import { useSwapAssets, type SwapSideAsset } from './use-swap-assets';

/**
 * Swap form state: pair (shared store — the picker sheet writes it too) +
 * sanitized local amount string, quote, validation and the executeSwap
 * mutation. Holdings (client) × prices (server) join here, at render.
 */
export function useSwapForm(initialFromId?: string) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const pair = useSwapPairStore();
  const [amount, setAmountState] = useState('');
  const holdings = usePortfolioStore((state) => state.holdings);
  const { isPending: isPricesPending, data: markets } = useMarkets();
  const assets = useSwapAssets();

  // Deep-link sync (`/swap?from=<coinId>`). selectFromAsset is a zustand
  // module action (external store), not a React setState — lint-safe.
  useEffect(() => {
    if (initialFromId && getAsset(initialFromId)) {
      selectFromAsset(initialFromId);
    }
  }, [initialFromId]);

  const setAmount = useCallback((raw: string) => {
    setAmountState(sanitizeAmountInput(raw));
  }, []);

  const setMax = useCallback(() => {
    const balance = usePortfolioStore.getState().holdings[pair.fromId] ?? 0;
    // toFixed() (no args) never renders exponential notation, unlike String().
    setAmountState(big(String(balance)).toFixed());
  }, [pair.fromId]);

  const prices = useMemo<PriceMap>(
    () =>
      Object.fromEntries(
        (markets ?? []).map((coin) => [coin.id, coin.current_price]),
      ),
    [markets],
  );

  const from: SwapSideAsset =
    assets.find((asset) => asset.id === pair.fromId) ?? assets[0];
  const to: SwapSideAsset =
    assets.find((asset) => asset.id === pair.toId) ?? assets[0];

  const validation = useMemo(
    () =>
      validateSwap({
        fromId: pair.fromId,
        toId: pair.toId,
        fromAmount: amount,
        holdings,
        prices,
      }),
    [amount, holdings, pair, prices],
  );

  // Quote is independent of the balance check: the user still sees what an
  // over-balance amount would yield, alongside the INSUFFICIENT_FUNDS error.
  const quote = useMemo<SwapCalculation | null>(() => {
    if (pair.fromId === pair.toId) return null;
    if (prices[pair.fromId] === undefined || prices[pair.toId] === undefined) {
      return null;
    }
    try {
      if (!big(amount).gt(0)) return null;
    } catch {
      return null;
    }
    return calculateSwap(pair.fromId, pair.toId, amount, prices);
  }, [amount, pair, prices]);

  // T16 records the persistent notification here as well, after the
  // Transaction resolves; the toast is the transient half of the alert.
  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: executeSwap,
    onSuccess: (transaction) => {
      setAmountState('');
      const locale = i18n.language;
      toast.success(t('swap.successTitle'), {
        description: t('swap.success', {
          from: `${formatAmount(transaction.fromAmount, 8, locale)} ${getAsset(transaction.fromId)?.symbol ?? ''}`,
          to: `${formatAmount(transaction.toAmount, 8, locale)} ${getAsset(transaction.toId)?.symbol ?? ''}`,
        }),
      });
      router.navigate('/');
    },
  });

  const submit = useCallback(() => {
    mutate({
      fromId: pair.fromId,
      toId: pair.toId,
      fromAmount: amount,
      prices,
      // Fresh snapshot at submit time — executeSwap re-validates as the race guard.
      holdings: usePortfolioStore.getState().holdings,
    });
  }, [amount, mutate, pair, prices]);

  // Pristine form (empty amount) shows no error; MISSING_PRICE is suppressed
  // while the first prices load — it's a loading state, not a failure.
  const errorCode: SwapValidationErrorCode | null =
    amount === '' || validation.ok
      ? null
      : validation.error === 'MISSING_PRICE' && isPricesPending
        ? null
        : validation.error;

  return {
    from,
    to,
    amount,
    setAmount,
    setMax,
    quote,
    errorCode,
    submit,
    isSubmitting,
    canSubmit: validation.ok && !isSubmitting,
  };
}
