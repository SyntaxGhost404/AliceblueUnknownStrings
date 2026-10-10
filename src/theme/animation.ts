import { Animated, Easing } from 'react-native';

// Every timed animation in the game goes through these helpers so the easing curve
// (ease-out) and native-driver defaults stay consistent across screens.

export function createAnimation(
  value: Animated.Value,
  toValue = 1,
  duration = 800,
  easing: (t: number) => number = Easing.out(Easing.ease),
  useNativeDriver = true,
) {
  return Animated.timing(value, { toValue, duration, easing, useNativeDriver });
}

export function playAnimation(
  value: Animated.Value,
  toValue = 1,
  duration = 800,
  easing: (t: number) => number = Easing.out(Easing.ease),
  useNativeDriver = true,
) {
  const animation = createAnimation(value, toValue, duration, easing, useNativeDriver);
  animation.start();
  return animation;
}
