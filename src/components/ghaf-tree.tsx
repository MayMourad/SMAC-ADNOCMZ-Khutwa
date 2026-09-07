/**
 * GhafTree
 * ========
 *
 * The shared family tree, drawn as an SVG that grows through six stages and
 * gains a warm glow + drifting motes when the family is together (`blooming`).
 *
 * Motion (all on the UI thread, transform/opacity only):
 *  - sway: the whole tree rotates ±1.1° on a slow sine loop (mount, no state).
 *    Purpose: "alive, not frozen". Dropped under reduced motion.
 *  - bloom: a pre-rendered gold glow layer fades + scales in (delight tier, a
 *    little overshoot is right here), six motes drift up and fade on a loop,
 *    and a Success haptic fires once on the transition.
 *
 * The SVG drawing itself is static per stage — cheaper and sharper than
 * animating vector geometry.
 */

import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { GrowthStage } from '@/types/models';

const GROWTH: Record<GrowthStage, number> = {
  seed: 0,
  sprout: 0.18,
  sapling: 0.36,
  young: 0.56,
  mature: 0.78,
  ancient: 1,
};

const BARK = '#7A5A38';
const BARK_DARK = '#5E4429';
const MOTE_COUNT = 6;

export interface GhafTreeProps {
  stage: GrowthStage;
  blooming?: boolean;
  size?: number;
}

export function GhafTree({ stage, blooming = false, size = 220 }: GhafTreeProps) {
  const theme = useTheme();
  // Reanimated's worklet runtime doesn't drive animations on web here — render
  // the tree in its resting state there, same as under reduced motion.
  const reduced = useReducedMotion() || Platform.OS === 'web';
  const g = GROWTH[stage];

  // --- sway + bloom-scale on an outer view -----------------------------
  const sway = useSharedValue(0);
  const bloom = useSharedValue(blooming ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      sway.set(0);
      return;
    }
    sway.set(
      withRepeat(
        withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(sway);
  }, [reduced, sway]);

  useEffect(() => {
    bloom.set(
      reduced
        ? withTiming(blooming ? 1 : 0, { duration: 180 })
        : withSpring(blooming ? 1 : 0, { duration: 550, dampingRatio: 0.7 }),
    );
    if (blooming && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [blooming, reduced, bloom]);

  const treeStyle = useAnimatedStyle(() => {
    const deg = (sway.get() - 0.5) * 2.2; // -1.1 .. 1.1
    const scale = 1 + bloom.get() * 0.035;
    return { transform: [{ rotate: `${deg}deg` }, { scale }] };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: bloom.get() * 0.9,
    transform: [{ scale: 0.7 + bloom.get() * 0.5 }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* pre-styled glow layer — we fade its opacity, never its blur/elevation */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          glowStyle,
          {
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: size,
            backgroundColor: theme.accent,
          },
        ]}
      />

      {[...Array(MOTE_COUNT)].map((i, idx) => (
        <Mote key={idx} index={idx} size={size} active={blooming && !reduced} color={theme.accent} />
      ))}

      <Animated.View style={treeStyle}>
        <TreeSvg g={g} size={size} primary={theme.primary} primaryDeep={theme.primaryDeep} />
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// One drifting mote
// ---------------------------------------------------------------------------

function Mote({
  index,
  size,
  active,
  color,
}: {
  index: number;
  size: number;
  active: boolean;
  color: string;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      cancelAnimation(t);
      t.set(withTiming(0, { duration: 200 }));
      return;
    }
    t.set(
      withDelay(
        index * 320,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 2600, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 0 }),
          ),
          -1,
        ),
      ),
    );
    return () => cancelAnimation(t);
  }, [active, index, t]);

  const style = useAnimatedStyle(() => {
    const p = t.get();
    return {
      opacity: p === 0 ? 0 : Math.sin(p * Math.PI) * 0.9,
      transform: [
        { translateX: (index - MOTE_COUNT / 2) * (size * 0.06) },
        { translateY: size * 0.18 - p * size * 0.5 },
        { scale: 0.5 + p * 0.5 },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.mote,
        style,
        { backgroundColor: color, top: size * 0.32 },
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// The drawing, parameterised by growth g (0..1)
// ---------------------------------------------------------------------------

function TreeSvg({
  g,
  size,
  primary,
  primaryDeep,
}: {
  g: number;
  size: number;
  primary: string;
  primaryDeep: string;
}) {
  const W = 100;
  const H = 100;
  const groundY = 86;

  // trunk grows taller + thicker with g
  const trunkH = 8 + g * 34;
  const trunkTopY = groundY - trunkH;
  const trunkW = 2.2 + g * 7;

  // canopy grows wide + low (the Ghaf umbrella) with g
  const canopyRx = 6 + g * 40;
  const canopyRy = 4 + g * 20;
  const canopyCy = trunkTopY - canopyRy * 0.35;

  const showCanopy = g > 0.05;
  const showBranches = g > 0.4;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <LinearGradient id="canopy" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={primary} />
          <Stop offset="1" stopColor={primaryDeep} />
        </LinearGradient>
      </Defs>

      {/* dune */}
      <Ellipse cx={W / 2} cy={groundY + 8} rx={44} ry={9} fill={primary} opacity={0.12} />

      {/* trunk */}
      <Path
        d={`M ${W / 2 - trunkW / 2} ${groundY}
            Q ${W / 2 - trunkW * 0.2} ${trunkTopY + trunkH * 0.4} ${W / 2 - trunkW * 0.35} ${trunkTopY}
            L ${W / 2 + trunkW * 0.35} ${trunkTopY}
            Q ${W / 2 + trunkW * 0.2} ${trunkTopY + trunkH * 0.4} ${W / 2 + trunkW / 2} ${groundY} Z`}
        fill={BARK}
      />
      <Path
        d={`M ${W / 2} ${groundY} L ${W / 2} ${trunkTopY}`}
        stroke={BARK_DARK}
        strokeWidth={0.6}
        opacity={0.5}
      />

      {showBranches && (
        <>
          <Path
            d={`M ${W / 2} ${trunkTopY + 6} q -10 -4 -16 -12`}
            stroke={BARK}
            strokeWidth={2 + g}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M ${W / 2} ${trunkTopY + 9} q 10 -3 15 -11`}
            stroke={BARK}
            strokeWidth={2 + g}
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}

      {showCanopy && (
        <>
          <Ellipse cx={W / 2} cy={canopyCy} rx={canopyRx} ry={canopyRy} fill="url(#canopy)" />
          <Ellipse
            cx={W / 2 - canopyRx * 0.4}
            cy={canopyCy - canopyRy * 0.2}
            rx={canopyRx * 0.55}
            ry={canopyRy * 0.8}
            fill="url(#canopy)"
          />
          <Ellipse
            cx={W / 2 + canopyRx * 0.42}
            cy={canopyCy - canopyRy * 0.1}
            rx={canopyRx * 0.5}
            ry={canopyRy * 0.75}
            fill="url(#canopy)"
          />
          {/* sun-side highlight */}
          <Ellipse
            cx={W / 2 - canopyRx * 0.3}
            cy={canopyCy - canopyRy * 0.4}
            rx={canopyRx * 0.35}
            ry={canopyRy * 0.4}
            fill={primary}
            opacity={0.5}
          />
        </>
      )}

      {/* a sprout dot for the seed stage */}
      {!showCanopy && (
        <Ellipse cx={W / 2} cy={trunkTopY - 1} rx={2.4} ry={2.4} fill={primary} />
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    ...Shadow.bloom,
  },
  mote: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
