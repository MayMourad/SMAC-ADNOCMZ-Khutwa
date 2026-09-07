/**
 * PillButton — the one button. Filled / outline / ghost, one size language.
 */
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PressableScale } from '@/components/pressable-scale';
import { Radii, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';

export function PillButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  full = false,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  full?: boolean;
}) {
  const theme = useTheme();
  const isFilled = variant === 'primary' || variant === 'accent';
  const bg =
    variant === 'primary'
      ? theme.primary
      : variant === 'accent'
        ? theme.accent
        : 'transparent';
  const fg =
    variant === 'primary'
      ? theme.onPrimary
      : variant === 'accent'
        ? theme.onAccent
        : theme.text;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        { backgroundColor: bg, alignSelf: full ? 'stretch' : 'flex-start' },
        variant === 'outline' && { borderWidth: 1.5, borderColor: theme.text },
        isFilled && Shadow.sm,
        (disabled || loading) && styles.disabled,
      ]}>
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={fg} size="small" />
        ) : (
          <>
            {icon}
            <ThemedText type="subtitle" style={{ color: fg }}>
              {label}
            </ThemedText>
          </>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.pill,
    paddingVertical: 14,
    paddingHorizontal: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  disabled: { opacity: 0.45 },
});
