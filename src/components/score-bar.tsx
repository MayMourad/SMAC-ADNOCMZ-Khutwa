/**
 * ScoreBar — one sub-score (Root / Bloom / Heritage) as a slim animated meter.
 */

import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing, type ThemeColor } from '@/constants/theme';
import { clamp } from '@/logic/khutwaScore';
import { useTheme } from '@/hooks/use-theme';

export function ScoreBar({
  label,
  sublabel,
  value,
  tone = 'primary',
}: {
  label: string;
  sublabel?: string;
  value: number; // 0–100
  tone?: ThemeColor;
}) {
  const theme = useTheme();
  const pct = clamp(value);
  const w = useSharedValue(0);
  const noAnim = Platform.OS === 'web' || useReducedMotion();

  useEffect(() => {
    w.set(noAnim ? pct / 100 : withSpring(pct / 100, { duration: 700, dampingRatio: 1 }));
  }, [pct, w, noAnim]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${w.get() * 100}%` }));

  return (
    <View style={styles.row}>
      <View style={styles.labels}>
        <ThemedText type="callout">
          {label}
          {sublabel ? (
            <ThemedText type="small" color="textMuted">
              {'  '}
              {sublabel}
            </ThemedText>
          ) : null}
        </ThemedText>
        <ThemedText type="callout" color="textSecondary" ltr>
          {Math.round(pct)}
        </ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.backgroundAlt }]}>
        <Animated.View
          style={[styles.fill, fillStyle, { backgroundColor: theme[tone] }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignSelf: 'stretch', gap: Spacing.one },
  labels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  track: { height: 8, borderRadius: Radii.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radii.pill },
});
