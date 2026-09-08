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
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
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
  const groundY = 87;
  const cx = W / 2;

  // trunk: taller, thicker and a touch more curved as it grows
  const trunkH = 7 + g * 36;
  const topY = groundY - trunkH;
  const trunkW = 2 + g * 8;
  const lean = (g - 0.3) * 4; // slight character bend once established

  // canopy: the wide, low Ghaf umbrella
  const rx = 7 + g * 41;
  const ry = 5 + g * 19;
  const cy = topY - ry * 0.25;

  const hasCanopy = g > 0.06;
  const hasBranches = g > 0.38;
  const hasRoots = g > 0.22;
  // little leaf-cluster tufts around the canopy edge for the "feathery" read
  const tufts = hasCanopy
    ? Array.from({ length: Math.round(4 + g * 8) }, (_, i) => {
        const a = Math.PI + (i / Math.round(4 + g * 8)) * Math.PI;
        return { x: cx + Math.cos(a) * rx * 0.92, y: cy + Math.sin(a) * ry * 0.82 };
      })
    : [];

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <LinearGradient id="canopy" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={primary} />
          <Stop offset="1" stopColor={primaryDeep} />
        </LinearGradient>
        <LinearGradient id="bark" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={BARK_DARK} />
          <Stop offset="0.5" stopColor={BARK} />
          <Stop offset="1" stopColor={BARK_DARK} />
        </LinearGradient>
        <RadialGradient id="soil" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#000000" stopOpacity={0.12} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* cast shadow */}
      <Ellipse cx={cx + 3} cy={groundY + 3} rx={4 + rx * 0.7} ry={4 + g * 5} fill="url(#soil)" />

      {/* surface roots */}
      {hasRoots && (
        <G stroke={BARK} strokeLinecap="round" fill="none">
          <Path d={`M ${cx - 1} ${groundY - 1} q -6 1 -11 4`} strokeWidth={1.4 + g} />
          <Path d={`M ${cx + 1} ${groundY - 1} q 6 1 12 3`} strokeWidth={1.4 + g} />
          <Path d={`M ${cx} ${groundY} q -2 2 -5 4`} strokeWidth={1 + g * 0.6} />
        </G>
      )}

      {/* trunk — tapered, gently curved */}
      <Path
        d={`M ${cx - trunkW / 2} ${groundY}
            C ${cx - trunkW * 0.55} ${groundY - trunkH * 0.5} ${cx - trunkW * 0.15 + lean} ${topY + trunkH * 0.35} ${cx - trunkW * 0.3 + lean} ${topY}
            L ${cx + trunkW * 0.3 + lean} ${topY}
            C ${cx + trunkW * 0.15 + lean} ${topY + trunkH * 0.35} ${cx + trunkW * 0.55} ${groundY - trunkH * 0.5} ${cx + trunkW / 2} ${groundY} Z`}
        fill="url(#bark)"
      />

      {hasBranches && (
        <G stroke={BARK} strokeLinecap="round" fill="none">
          <Path d={`M ${cx + lean} ${topY + 5} q -12 -3 -19 -13`} strokeWidth={1.6 + g * 1.4} />
          <Path d={`M ${cx + lean} ${topY + 8} q 12 -2 18 -12`} strokeWidth={1.6 + g * 1.4} />
          <Path d={`M ${cx + lean} ${topY + 3} q -3 -6 -4 -11`} strokeWidth={1.2 + g} />
        </G>
      )}

      {hasCanopy ? (
        <>
          {/* darker underside */}
          <Ellipse cx={cx + lean} cy={cy + ry * 0.25} rx={rx * 0.98} ry={ry * 0.9} fill={primaryDeep} />
          {/* main mass — layered organic blobs */}
          <Ellipse cx={cx + lean} cy={cy} rx={rx} ry={ry} fill="url(#canopy)" />
          <Ellipse cx={cx - rx * 0.42 + lean} cy={cy - ry * 0.15} rx={rx * 0.6} ry={ry * 0.85} fill="url(#canopy)" />
          <Ellipse cx={cx + rx * 0.45 + lean} cy={cy - ry * 0.08} rx={rx * 0.55} ry={ry * 0.8} fill="url(#canopy)" />
          <Ellipse cx={cx + lean} cy={cy - ry * 0.55} rx={rx * 0.6} ry={ry * 0.55} fill="url(#canopy)" />
          {/* feathery edge tufts */}
          {tufts.map((p, i) => (
            <Circle key={i} cx={p.x + lean} cy={p.y} r={ry * 0.16 + 0.6} fill={primary} opacity={0.9} />
          ))}
          {/* sun-side highlight */}
          <Ellipse
            cx={cx - rx * 0.3 + lean}
            cy={cy - ry * 0.4}
            rx={rx * 0.34}
            ry={ry * 0.38}
            fill="#FFFFFF"
            opacity={0.14}
          />
        </>
      ) : (
        // seed / sprout: a pair of tiny leaves
        <G fill={primary}>
          <Ellipse cx={cx - 2} cy={topY - 1} rx={2.6} ry={1.6} />
          <Ellipse cx={cx + 2} cy={topY - 2} rx={2.6} ry={1.6} />
        </G>
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
