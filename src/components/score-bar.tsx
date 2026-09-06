/**
 * ScoreBar
 * ========
 *
 * A labelled 0–100 progress bar. Used on Home to show the Khutwa Score and its
 * three sub-scores (Root / Bloom / Heritage).
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { clamp } from '@/logic/khutwaScore';

export interface ScoreBarProps {
  label: string;
  value: number; // 0–100
  /** Optional accent colour for the fill (defaults to the theme text colour). */
  color?: string;
  /** Bigger text + taller track for the headline Khutwa Score. */
  emphasis?: boolean;
}

export function ScoreBar({ label, value, color, emphasis = false }: ScoreBarProps) {
  const theme = useTheme();
  const pct = clamp(value);
  const trackHeight = emphasis ? 14 : 8;

  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        <ThemedText type={emphasis ? 'subtitle' : 'small'}>{label}</ThemedText>
        <ThemedText type={emphasis ? 'subtitle' : 'smallBold'}>{Math.round(pct)}</ThemedText>
      </View>
      <View
        style={[
          styles.track,
          { height: trackHeight, borderRadius: trackHeight / 2, backgroundColor: theme.backgroundElement },
        ]}>
        <View
          style={[
            styles.fill,
            {
              width: `${pct}%`,
              borderRadius: trackHeight / 2,
              backgroundColor: color ?? theme.text,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignSelf: 'stretch',
    gap: Spacing.one,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  track: {
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
