/**
 * Card — the standard raised surface. One radius, one shadow language.
 */
import { View, type ViewProps } from 'react-native';

import { Radii, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CardProps = ViewProps & {
  /** `elevated` (default) casts a soft shadow; `flat` is a bordered inset. */
  variant?: 'elevated' | 'flat';
  padding?: keyof typeof Spacing | 'none';
};

export function Card({
  variant = 'elevated',
  padding = 'four',
  style,
  ...rest
}: CardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: variant === 'elevated' ? theme.surface : theme.backgroundAlt,
          borderRadius: Radii.xl,
          padding: padding === 'none' ? 0 : Spacing[padding],
        },
        variant === 'elevated' ? Shadow.md : { borderWidth: 1, borderColor: theme.border },
        style,
      ]}
      {...rest}
    />
  );
}
