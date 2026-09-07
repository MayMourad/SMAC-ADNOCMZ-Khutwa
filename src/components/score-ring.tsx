/**
 * ScoreRing
 * =========
 *
 * The headline Khutwa Score as a circular gauge. The arc fills with a spring
 * from its current value (interruptible / re-animates on change) and the number
 * counts up to match. Honours reduced-motion.
 */

import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { clamp } from '@/logic/khutwaScore';
import { useTheme } from '@/hooks/use-theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ScoreRing({
  value,
  label,
  size = 176,
  stroke = 14,
}: {
  value: number; // 0–100
  label: string;
  size?: number;
  stroke?: number;
}) {
  const theme = useTheme();
  const target = clamp(value);
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  const progress = useSharedValue(0);
  const [display, setDisplay] = useState(0);
  const noAnim = Platform.OS === 'web' || useReducedMotion();

  useEffect(() => {
    if (noAnim) {
      progress.set(target / 100);
      setDisplay(target);
      return;
    }
    progress.set(withSpring(target / 100, { duration: 900, dampingRatio: 1 }));

    // count the number up alongside the arc
    const from = display;
    const start = Date.now();
    const dur = 900;
    const id = setInterval(() => {
      const k = Math.min(1, (Date.now() - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (k >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.get()),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={theme.backgroundAlt}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={theme.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <ThemedText
        style={{ fontFamily: Fonts.serifSemiBold, fontSize: size * 0.34, lineHeight: size * 0.36 }}>
        {display}
      </ThemedText>
      <ThemedText type="label" color="textMuted" uppercase>
        {label}
      </ThemedText>
    </View>
  );
}
