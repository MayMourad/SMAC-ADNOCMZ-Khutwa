/**
 * OasisScene
 * ==========
 *
 * The illustrated backdrop for the landing + login screens: a gradient sky, a
 * low sun, layered sand dunes, faint stars, rising motes, and (optionally) the
 * Ghaf tree standing on the front dune.
 *
 * Inspired by "Dayrise" — a sky that *reacts*. Two ways it moves here:
 *
 *  1. `scrollY` (a shared value from the screen's scroll view): as the page is
 *     pulled up the sun sinks below the dunes, a night gradient fades in and the
 *     stars brighten — dusk -> night, driven 1:1 by the scroll position. This is
 *     input-driven, so it runs on web too, not just device.
 *
 *  2. `blooming`: the tree lights up — gold glow, rising motes, a Success haptic
 *     on device (the screens wire a tap-zone over the crown to toggle this). A
 *     plain static glow stands in on web where Reanimated's timed glow doesn't
 *     run.
 *
 * Ambient motion (device only): the back dune layers drift, motes rise.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';

import { GhafTree } from '@/components/ghaf-tree';
import type { GrowthStage } from '@/types/models';

export type SceneMood = 'dawn' | 'day' | 'dusk' | 'bloom';

const SKY: Record<SceneMood, [string, string, string]> = {
  dawn: ['#F6E4D6', '#F3D9C0', '#EBC7A6'],
  day: ['#E9EEF0', '#F1E9DA', '#F0E2C9'],
  dusk: ['#E7D6C4', '#EBC49F', '#D99B6E'],
  bloom: ['#F5E2C0', '#F0C583', '#E0A44B'],
};
const SUN: Record<SceneMood, string> = {
  dawn: '#F4B47A',
  day: '#F6E6B8',
  dusk: '#E9A24C',
  bloom: '#F2C56A',
};
// the colour the sky settles to once the page is fully pulled up
const NIGHT: [string, string, string] = ['#2E2C42', '#3C3650', '#574a5b'];

const MOTES = 7;

export function OasisScene({
  mood = 'dusk',
  height = 320,
  showTree = true,
  stage = 'young',
  blooming = false,
  treeSize,
  scrollY,
  nightAt = 200,
  style,
}: {
  mood?: SceneMood;
  height?: number;
  showTree?: boolean;
  stage?: GrowthStage;
  blooming?: boolean;
  treeSize?: number;
  /** Scroll offset of the screen's scroll view. Drives the dusk -> night shift. */
  scrollY?: SharedValue<number>;
  /** Pixels of scroll over which the sky goes fully to night. */
  nightAt?: number;
  style?: ViewStyle;
}) {
  const reduced = useReducedMotion() || Platform.OS === 'web';
  const drift = useSharedValue(0);
  // 0 -> 1 when the tree blooms: warms the whole sky to gold
  const bloomSky = useSharedValue(blooming ? 1 : 0);

  // 0 at rest, 1 when the page is pulled all the way up
  const p = useDerivedValue(() => {
    'worklet';
    if (!scrollY) return 0;
    const v = scrollY.get() / nightAt;
    return v < 0 ? 0 : v > 1 ? 1 : v;
  });

  useEffect(() => {
    if (reduced) return;
    drift.set(
      withRepeat(withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
    return () => cancelAnimation(drift);
  }, [reduced, drift]);

  useEffect(() => {
    // on web this is a direct set (instant); on device it crossfades
    bloomSky.set(reduced ? (blooming ? 1 : 0) : withTiming(blooming ? 1 : 0, { duration: 600 }));
  }, [blooming, reduced, bloomSky]);

  const backDune = useAnimatedStyle(() => ({
    transform: [{ translateX: (drift.get() - 0.5) * 18 }, { translateY: p.get() * -10 }],
  }));
  const midDune = useAnimatedStyle(() => ({
    transform: [{ translateX: (drift.get() - 0.5) * -10 }, { translateY: p.get() * -6 }],
  }));
  const nightStyle = useAnimatedStyle(() => ({ opacity: p.get() }));
  const bloomStyle = useAnimatedStyle(() => ({ opacity: bloomSky.get() * 0.7 }));
  const starStyle = useAnimatedStyle(() => ({ opacity: 0.12 + p.get() * 0.66 }));
  const sunStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: p.get() * height * 0.34 }],
    opacity: 1 - p.get() * 0.9,
  }));

  const [c0, c1, c2] = SKY[mood];
  const sun = SUN[mood];
  const showStars = mood === 'dawn' || mood === 'dusk' || !!scrollY;
  const W = 100;
  const H = 100;

  const treeBlooming = blooming || mood === 'bloom';

  return (
    <View style={[{ height, overflow: 'hidden' }, style]}>
      <LinearGradient colors={[c0, c1, c2]} style={StyleSheet.absoluteFill} />

      {/* night sky — fades in as the page is pulled up */}
      {scrollY && (
        <Animated.View style={[StyleSheet.absoluteFill, nightStyle]}>
          <LinearGradient colors={NIGHT} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}

      {/* golden wash — fades in when the tree blooms */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, bloomStyle]}>
        <LinearGradient colors={SKY.bloom} style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* stars */}
      {showStars && (
        <Animated.View style={[StyleSheet.absoluteFill, scrollY ? starStyle : undefined]}>
          <Svg
            style={StyleSheet.absoluteFill}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid slice">
            {[
              [12, 14],
              [28, 8],
              [46, 18],
              [70, 10],
              [84, 22],
              [60, 6],
              [92, 12],
              [20, 26],
              [38, 4],
              [78, 30],
            ].map(([x, y], i) => (
              <Circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 0.7 : 0.5} fill="#FFFFFF" opacity={0.55} />
            ))}
          </Svg>
        </Animated.View>
      )}

      {/* sun with soft halo — sinks below the dunes as p -> 1 */}
      <Animated.View style={[StyleSheet.absoluteFill, scrollY ? sunStyle : undefined]}>
        <Svg
          style={StyleSheet.absoluteFill}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice">
          <Defs>
            <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={sun} stopOpacity={0.9} />
              <Stop offset="1" stopColor={sun} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={68} cy={40} r={22} fill="url(#sunGlow)" />
          <Circle cx={68} cy={40} r={8} fill={sun} />
        </Svg>
      </Animated.View>

      {/* dunes — back to front */}
      <Animated.View style={[StyleSheet.absoluteFill, backDune]}>
        <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
          <Path d={`M-10 78 Q 25 62 55 74 T 120 70 L120 100 L-10 100 Z`} fill="#E7D3B5" opacity={0.7} />
        </Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, midDune]}>
        <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
          <Path d={`M-10 86 Q 35 74 62 84 T 120 82 L120 100 L-10 100 Z`} fill="#D9BF98" opacity={0.85} />
        </Svg>
      </Animated.View>
      <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
        <Path d={`M-10 93 Q 45 84 80 92 T 130 90 L130 100 L-10 100 Z`} fill="#C9A978" />
        <Ellipse cx={30} cy={95} rx={26} ry={4} fill="#000000" opacity={0.05} />
      </Svg>

      {/* the tree, standing on the front dune */}
      {showTree && (
        <View style={styles.treeSlot} pointerEvents="none">
          {/* web stand-in for the bloom glow (Reanimated's timed glow is device-only) */}
          {treeBlooming && Platform.OS === 'web' && (
            <View
              style={[
                styles.webGlow,
                {
                  width: (treeSize ?? 200) * 0.85,
                  height: (treeSize ?? 200) * 0.85,
                  borderRadius: treeSize ?? 200,
                  backgroundColor: SUN.bloom,
                },
              ]}
            />
          )}
          <GhafTree
            stage={stage}
            blooming={treeBlooming}
            size={treeSize ?? Math.min(height * 0.9, 240)}
          />
        </View>
      )}

      {/* rising motes */}
      {[...Array(MOTES)].map((x, i) => (
        <Mote key={i} index={i} height={height} active={!reduced} color={sun} />
      ))}
    </View>
  );
}

function Mote({
  index,
  height,
  active,
  color,
}: {
  index: number;
  height: number;
  active: boolean;
  color: string;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!active) return;
    t.set(
      withRepeat(
        withTiming(1, { duration: 5200, easing: Easing.out(Easing.quad) }),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(t);
  }, [active, t]);

  const style = useAnimatedStyle(() => {
    const p = (t.get() + index / MOTES) % 1;
    return {
      opacity: Math.sin(p * Math.PI) * 0.5,
      transform: [{ translateY: height * 0.9 - p * height * 0.8 }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: `${8 + index * 12}%`,
          width: 5,
          height: 5,
          borderRadius: 3,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  treeSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -8,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  webGlow: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 0,
    opacity: 0.32,
  },
});
