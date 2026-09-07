/**
 * Screen — the standard page frame.
 *
 * Warm ground, a faint top wash of colour, safe-area top padding, optional
 * scroll, content capped at MaxContentWidth and centred, and bottom padding
 * that clears the floating tab bar.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ScreenProps = ViewProps & {
  scroll?: boolean;
  /** Tint of the faint top wash. 'primary' | 'accent' | 'none'. Default 'primary'. */
  wash?: 'primary' | 'accent' | 'none';
  /** Extra bottom padding beyond the tab-bar inset. */
  contentGap?: number;
};

export function Screen({
  scroll = true,
  wash = 'primary',
  children,
  style,
  contentGap = Spacing.four,
  ...rest
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const washColor =
    wash === 'accent' ? theme.accent : wash === 'none' ? 'transparent' : theme.primary;

  const inner = (
    <View
      style={[
        styles.inner,
        { paddingTop: insets.top + Spacing.three, gap: contentGap },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {wash !== 'none' && (
        <LinearGradient
          pointerEvents="none"
          colors={[washColor + '22', washColor + '00']}
          style={styles.wash}
        />
      )}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: BottomTabInset + contentGap },
          ]}
          showsVerticalScrollIndicator={false}>
          {inner}
        </ScrollView>
      ) : (
        <View style={styles.fill}>{inner}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { flex: 1 },
  wash: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  scrollContent: { alignItems: 'center', paddingHorizontal: Spacing.four },
  inner: { width: '100%', maxWidth: MaxContentWidth },
});
