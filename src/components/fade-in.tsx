/**
 * FadeIn — a small mount entrance (opacity + a short rise).
 *
 * On device this plays a 420ms ease-out. On web — where this project's
 * Reanimated 4 worklet runtime doesn't drive animations — and under reduced
 * motion, it renders its children at the final visible state immediately (no
 * entrance). The important guarantee: content is never left hidden.
 *
 * Gate: entrance is the "occasional / first-time" tier — one per screen mount,
 * purpose = preventing a jarring pop-in.
 */

import { useEffect } from 'react';
import { Platform, type ViewProps } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export function FadeIn({
  delay = 0,
  distance = 14,
  style,
  children,
  ...rest
}: ViewProps & { delay?: number; distance?: number }) {
  const reduced = useReducedMotion();
  const animate = Platform.OS !== 'web' && !reduced;
  const p = useSharedValue(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) return;
    p.set(withDelay(delay, withTiming(1, { duration: 420, easing: EASE_OUT })));
  }, [delay, p, animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: p.get(),
    transform: [{ translateY: (1 - p.get()) * distance }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]} {...rest}>
      {children}
    </Animated.View>
  );
}
