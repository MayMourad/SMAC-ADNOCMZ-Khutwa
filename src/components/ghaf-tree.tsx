/**
 * GhafTree
 * ========
 *
 * The shared family tree. For the MVP this is a simple, readable representation:
 * the tree "grows" through six emoji stages and gains a soft glow ring when the
 * family is together (`blooming`).
 *
 * This is deliberately a PLACEHOLDER for the real "clean 2D / lightly-3D"
 * artwork from the brief. Swapping in illustrated stage assets later means only
 * changing `STAGE_ART` and the container — nothing else in the app cares.
 *
 * Kept as plain React Native (no animation lib) so it's easy to explain. If you
 * want the bloom to pulse, wrap the halo in a react-native-reanimated
 * `withRepeat(withTiming(...))` — see the `animate-expo` notes in docs/.
 */

import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { GrowthStage } from '@/types/models';

const STAGE_ART: Record<GrowthStage, { emoji: string; caption: string }> = {
  seed: { emoji: '·', caption: 'A seed, waiting for the first walk.' },
  sprout: { emoji: '🌱', caption: 'A sprout — your first steps together.' },
  sapling: { emoji: '🌿', caption: 'A sapling finding its roots.' },
  young: { emoji: '🌳', caption: 'A young Ghaf, steady and growing.' },
  mature: { emoji: '🌳', caption: 'A strong tree, full of shared memories.' },
  ancient: { emoji: '🌳', caption: 'An ancient Ghaf — a family landmark.' },
};

export interface GhafTreeProps {
  stage: GrowthStage;
  blooming?: boolean;
  /** Diameter of the tree circle in px. */
  size?: number;
}

export function GhafTree({ stage, blooming = false, size = 200 }: GhafTreeProps) {
  const theme = useTheme();
  const art = STAGE_ART[stage];

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.halo,
          {
            width: size + Spacing.five,
            height: size + Spacing.five,
            borderRadius: (size + Spacing.five) / 2,
            // Bloom = warm gold glow; otherwise invisible.
            backgroundColor: blooming ? 'rgba(240, 190, 90, 0.35)' : 'transparent',
          },
        ]}
      />
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.backgroundElement,
            borderColor: blooming ? 'rgba(240, 190, 90, 0.9)' : theme.backgroundSelected,
          },
        ]}>
        <Text style={{ fontSize: size * 0.5 }}>{art.emoji}</Text>
      </View>
      <Text style={[styles.caption, { color: theme.textSecondary }]}>
        {blooming ? 'Your family is here together — the tree is blooming.' : art.caption}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  halo: {
    position: 'absolute',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 280,
  },
});
