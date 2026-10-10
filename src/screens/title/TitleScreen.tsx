import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import assets from '../../assets';
import { createAnimation, playAnimation } from '../../theme/animation';
import { isGameScreen, MainStackParamList } from '../../navigation/types';
import { GAME_TITLE, TITLE_GOLD } from '../../config';

type Props = StackScreenProps<MainStackParamList, 'title'>;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen');

/**
 * Title card shown on launch from Episode 1 onwards: the key art fades in with its
 * light flickering (two exposures cross-fading), holds, fades out and hands over.
 */
export default function TitleScreen({ navigation, route }: Props) {
  const nextScreen = route.params?.nextScreen;
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [blinkAnim] = useState(() => new Animated.Value(0));
  const blinkLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    playAnimation(fadeAnim, 1, 1000);
    blinkLoop.current?.reset();
    blinkLoop.current = Animated.loop(
      Animated.sequence([
        createAnimation(blinkAnim, 0.2, 950, Easing.linear),
        createAnimation(blinkAnim, 1, 800, Easing.linear),
      ]),
    );
    blinkLoop.current.start();

    const fadeOut = setTimeout(() => playAnimation(fadeAnim, 0, 1000), 5000);
    const leave = setTimeout(() => {
      if (isGameScreen(nextScreen)) navigation.replace('game', { screen: nextScreen });
      else navigation.replace((nextScreen || 'episode') as any);
    }, 6500);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(leave);
      blinkLoop.current?.stop();
    };
  }, [nextScreen, navigation, fadeAnim, blinkAnim]);

  const lines = GAME_TITLE.split(' ');

  return (
    <Animated.View style={[styles.parentLayout]}>
      <Animated.View style={[styles.title, { opacity: fadeAnim }]}>
        <Animated.Image
          style={[styles.image, { opacity: blinkAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}
          source={assets['title-low']}
        />
        <Animated.Image style={[styles.image, { opacity: blinkAnim }]} source={assets.title} />
      </Animated.View>
      <Animated.View style={[styles.titletext, { opacity: fadeAnim }]}>
        <Text
          allowFontScaling={false}
          adjustsFontSizeToFit
          numberOfLines={lines.length}
          style={[styles.titleLettering, { lineHeight: TITLE_FONT_SIZE * 1.12 }]}>
          {lines.join('\n')}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const TITLE_FONT_SIZE = SCREEN_W * 0.2;

const styles = StyleSheet.create({
  parentLayout: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#070A0C' },
  title: {
    width: SCREEN_W * 1.1 < SCREEN_H * 0.5 ? '110%' : undefined,
    height: SCREEN_H * 0.5 < SCREEN_W * 1.1 ? '50%' : undefined,
    aspectRatio: 1.04,
  },
  titletext: { width: '100%', aspectRatio: 1.38, justifyContent: 'center', alignItems: 'center' },
  image: { position: 'absolute', width: '100%', height: '100%', resizeMode: 'contain' },
  titleLettering: {
    width: '88%',
    fontFamily: 'JosefinSans-Regular',
    fontSize: TITLE_FONT_SIZE,
    color: TITLE_GOLD,
    textAlign: 'center',
  },
});
