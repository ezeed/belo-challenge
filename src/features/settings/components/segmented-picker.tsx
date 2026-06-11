import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme';

export interface SegmentOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedPickerProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Single-select segmented control (radio group). Selected fill/border come from
 * `useTheme().colors` — not Tailwind `bg-primary` — so the active state resolves
 * to belo-indigo (light) / belo-mint (dark) reliably in RN.
 */
export function SegmentedPicker<T extends string>({
  options,
  value,
  onChange,
}: SegmentedPickerProps<T>) {
  const { colors } = useTheme();
  return (
    <View className="flex-row gap-2">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="radio"
            accessibilityLabel={opt.label}
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(opt.value)}
            style={
              selected
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { borderColor: colors.border }
            }
            className="flex-1 items-center rounded-xl border bg-surface-muted py-2"
          >
            <Text
              style={selected ? { color: colors.primaryForeground } : undefined}
              className={selected ? 'font-semibold' : 'text-text'}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
