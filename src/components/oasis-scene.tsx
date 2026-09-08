/**
 * OasisScene
 * ==========
 *
 * The illustrated backdrop for the landing + login screens: a gradient sky that
 * shifts with a `mood`, a low sun/moon, layered sand dunes, faint stars, rising
 * motes, and (optionally) the Ghaf tree standing on the front dune.
 *
 * Inspired by "Dayrise" — a dynamic sky that changes with progress. Here the
 * mood can be driven by the family's growth stage / bloom state.
 *
 * Motion (device only — Reanimated doesn't drive web here, so it renders
 * static): the two back dune layers drift a few px on a slow loop, motes rise.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
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

const MOTES = 7;

export function OasisScene({
  mood = 'dusk',
  height = 320,
  showTree = true,
  stage = 'young',
  blooming = false,
  treeSize,
  style,
}: {
  mood?: SceneMood;
  height?: number;
  showTree?: boolean;
  stage?: GrowthStage;
  blooming?: boolean;
  treeSize?: number;
  style?: ViewStyle;
}) {
  const reduced = useReducedMotion() || Platform.OS === 'web';
  const drift = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    drift.set(
      withRepeat(withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
    return () => cancelAnimation(drift);
  }, [reduced, drift]);

  const backDune = useAnimatedStyle(() => ({
    transform: [{ translateX: (drift.get() - 0.5) * 18 }],
  }));
  const midDune = useAnimatedStyle(() => ({
    transform: [{ translateX: (drift.get() - 0.5) * -10 }],
  }));

  const [c0, c1, c2] = SKY[mood];
  const sun = SUN[mood];
  const W = 100;
  const H = 100;

  return (
    <View style={[{ height, overflow: 'hidden' }, style]}>
      <LinearGradient colors={[c0, c1, c2]} style={StyleSheet.absoluteFill} />

      {/* stars (dawn / dusk only) */}
      {(mood === 'dawn' || mood === 'dusk') && (
        <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
          {[
            [12, 14],
            [28, 8],
            [46, 18],
            [70, 10],
            [84, 22],
            [60, 6],
            [92, 12],
          ].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={0.5} fill="#FFFFFF" opacity={0.5} />
          ))}
        </Svg>
      )}

      {/* sun / moon with soft halo */}
      <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={sun} stopOpacity={0.9} />
            <Stop offset="1" stopColor={sun} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={68} cy={40} r={22} fill="url(#sunGlow)" />
        <Circle cx={68} cy={40} r={8} fill={sun} />
      </Svg>

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
          <GhafTree
            stage={stage}
            blooming={blooming || mood === 'bloom'}
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
  },
});
