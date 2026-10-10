import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { createAnimation } from '../../theme/animation';

/** Opacity that pulses 1 → 0.1 → 1 while `active` (clue messages waiting to be noted). */
export default function useBlink(active: boolean) {
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!active) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        createAnimation(opacity, 0.1, 600, Easing.linear),
        createAnimation(opacity, 1, 600, Easing.linear),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      opacity.setValue(1);
    };
  }, [active, opacity]);
  return opacity;
}
