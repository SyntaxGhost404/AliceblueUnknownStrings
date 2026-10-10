import React, { useEffect, useState } from 'react';
import { Animated, Easing, I18nManager, StyleSheet, View } from 'react-native';
import { ArrowLeft, ArrowRight, Smartphone } from 'lucide-react-native';
import CustomImage from '../components/CustomImage';
import CustomText from '../components/CustomText';
import assets from '../assets';
import theme from '../theme/theme';
import { scale } from '../theme/scale';
import { createAnimation } from '../theme/animation';
import { getGeneral } from '../content/general';

/** First-time hint on Zoey's home screen: swipe right for the desk, left for her phone. */
export default function SwipeHelp({ text }: { text: string }) {
  const [anim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    anim.setValue(1);
    const loop = Animated.loop(
      Animated.sequence([createAnimation(anim, 0, 800, Easing.ease), createAnimation(anim, 1, 800, Easing.ease)]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const pulse = { transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }] };
  const Back = I18nManager.isRTL ? ArrowRight : ArrowLeft;

  return (
    <View pointerEvents="none" style={styles.helpContainer}>
      <View style={styles.help}>
        <Animated.View style={pulse}>
          <CustomImage width="70%" aspectRatio={1} source={assets.notifications.desk} />
        </Animated.View>
        <Animated.View style={{ transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }] }}>
          <ArrowRight size={scale(34)} color={theme.colors.white} />
        </Animated.View>
      </View>
      <CustomText center variant="small" style={{ width: '25%' }} bold white text={text} />
      <View style={styles.help}>
        <Animated.View style={{ transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) }] }}>
          <Back size={scale(34)} color={theme.colors.white} />
        </Animated.View>
        <Animated.View style={[{ alignItems: 'flex-end' }, pulse]}>
          <Smartphone size={scale(40)} color={theme.colors.white} />
        </Animated.View>
      </View>
      <CustomText
        center
        variant="small"
        style={{ position: 'absolute', left: '3%', bottom: '35%' }}
        noDefaultMargin
        bold
        white
        text={getGeneral('gameplay', 'desk')}
      />
      <CustomText
        center
        variant="small"
        style={{ position: 'absolute', right: '-3.2%', bottom: '35%' }}
        noDefaultMargin
        bold
        white
        text={getGeneral('gameplay', 'zoey_phone')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  helpContainer: {
    height: '50%',
    width: '90%',
    position: 'absolute',
    bottom: '10%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    opacity: 0.5,
  },
  help: { width: '25%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
