import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';
import CustomImage from '../components/CustomImage';
import CustomText from '../components/CustomText';
import assets from '../assets';
import theme from '../theme/theme';
import { GlobalContext } from '../state/GlobalProvider';
import { createAnimation, playAnimation } from '../theme/animation';
import { scale } from '../theme/scale';

const { width: W, height: H } = Dimensions.get('screen');
const BAR_W = W * 0.88;
const BAR_H = H * 0.06;
const ICON = W * 0.05;
const R = BAR_H / 2;

/**
 * Periodic nudge: a blinking bulb opens into a capsule reading "Stuck? Take a hint".
 * Tapping it grants the next hint; it folds away on its own after a few seconds.
 */
export default function HintReminder({ setShowHintReminder }: { setShowHintReminder: (v: boolean) => void }) {
  const insets = useSafeAreaInsets();
  const { session, hint, showAd } = useContext(GlobalContext);
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [iconAnim] = useState(() => new Animated.Value(1));
  const [barAnim] = useState(() => new Animated.Value(0));
  const [textAnim] = useState(() => new Animated.Value(0));
  const blink = useRef<Animated.CompositeAnimation | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    blink.current?.reset();
    timers.current.forEach(clearTimeout);
    iconAnim.setValue(1);
    playAnimation(fadeAnim, 1, 300);
    blink.current = Animated.loop(
      Animated.sequence([createAnimation(iconAnim, 0.4, 600, Easing.ease), createAnimation(iconAnim, 1, 600, Easing.ease)]),
    );
    blink.current.start();
    timers.current = [
      setTimeout(() => playAnimation(barAnim, 1, 800), 800),
      setTimeout(() => playAnimation(textAnim, 1), 1200),
      setTimeout(() => {
        playAnimation(fadeAnim, 0, 300);
        timers.current.push(setTimeout(() => setShowHintReminder(false), 300));
      }, 4500),
    ];
    return () => {
      blink.current?.stop();
      timers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.episode, session?.objective, hint]);

  const renderBarEnd = (side: 'Left' | 'Right') => {
    const fromCenter = side === 'Left' ? BAR_W / 2 - BAR_H / 2 + scale(1) : -BAR_W / 2 + BAR_H / 2 - scale(1);
    return (
      <Animated.View
        style={[
          styles.barEnd,
          {
            [side.toLowerCase()]: 0,
            [`borderTop${side}Radius`]: scale(100),
            [`borderBottom${side}Radius`]: scale(100),
            transform: [{ translateX: barAnim.interpolate({ inputRange: [0, 1], outputRange: [fromCenter, 0] }) }],
          },
        ]}
      />
    );
  };

  return (
    <Animated.View style={[styles.parentLayout, { top: insets.top + scale(10), opacity: fadeAnim }]}>
      <CustomButton
        onPress={() => {
          showAd();
          setShowHintReminder(false);
        }}
        activeOpacity={0.6}
        style={styles.button}>
        <Animated.View style={styles.bars}>
          {renderBarEnd('Left')}
          <Animated.View style={[styles.bar, { transform: [{ scaleX: barAnim }] }]} />
          {renderBarEnd('Right')}
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            left: R,
            width: ICON,
            aspectRatio: 1,
            opacity: iconAnim,
            transform: [
              { translateX: barAnim.interpolate({ inputRange: [0, 1], outputRange: [BAR_W / 2 - R - ICON / 2, 0] }) },
            ],
          }}>
          <CustomImage width="100%" height="100%" source={assets.notifications.bulb} />
        </Animated.View>
        <Animated.View style={{ opacity: textAnim }}>
          <CustomText bold noDefaultMargin variant="subtext" text="Stuck? Take a hint" color={theme.colors.hintButton} />
        </Animated.View>
      </CustomButton>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { position: 'absolute', left: W * 0.06, width: BAR_W, height: BAR_H },
  button: { width: '100%', height: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  bars: { position: 'absolute', flexDirection: 'row', width: BAR_W, height: BAR_H },
  bar: {
    position: 'absolute',
    left: R - scale(4),
    width: BAR_W - BAR_H + scale(8),
    height: BAR_H,
    backgroundColor: '#242426',
  },
  barEnd: { position: 'absolute', width: R, height: BAR_H, backgroundColor: '#242426' },
});
