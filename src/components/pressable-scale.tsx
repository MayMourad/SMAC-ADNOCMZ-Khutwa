/**
 * PressableScale
 * ==============
 *
 * A Pressable that responds on press-DOWN (not release): scales to 0.96 and
 * fires a light haptic immediately, springs back on release. This is the
 * "response is instant" rule from Apple's fluid-interface guidance.
 *
 * Spring is critically damped (no bounce) — a button press is not a
 * momentum gesture.
 */

import * as Haptics from 'expo-haptics';
import { Platform, Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { damping: 18, stiffness: 320, mass: 0.6 };

export type PressableScaleProps = PressableProps & {
  /** Scale at full press. Default 0.96. */
  activeScale?: number;
  /** Fire a light haptic on press-in. Default true. */
  haptic?: boolean;
};

export function PressableScale({
  activeScale = 0.96,
  haptic = true,
  onPressIn,
  onPressOut,
  style,
  children,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        scale.set(withSpring(activeScale, SPRING));
        if (haptic && Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, SPRING));
        onPressOut?.(e);
      }}
      style={[animatedStyle, style as object]}>
      {children as React.ReactNode}
    </AnimatedPressable>
  );
}
