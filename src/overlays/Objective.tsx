import React, { useContext, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import CustomImage from '../components/CustomImage';
import CustomText from '../components/CustomText';
import assets from '../assets';
import { GlobalContext } from '../state/GlobalProvider';
import { ContentContext } from '../state/ContentProvider';
import { createAnimation, playAnimation } from '../theme/animation';
import { scale } from '../theme/scale';

/** "New objective" pill that drops in at the top with a pulsing diamond for four seconds. */
export default function Objective({ setShowObjective }: { setShowObjective: (v: boolean) => void }) {
  const { session } = useContext(GlobalContext);
  const { getMainStoryEvent } = useContext(ContentContext);
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    playAnimation(fadeAnim, 1, 400);
    pulseAnim.setValue(1);
    const pulse = Animated.loop(
      Animated.sequence([
        createAnimation(pulseAnim, 1.3, 800, Easing.ease),
        createAnimation(pulseAnim, 1, 800, Easing.ease),
      ]),
    );
    pulse.start();
    const hide = setTimeout(() => setShowObjective(false), 4000);
    return () => {
      pulse.stop();
      clearTimeout(hide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View pointerEvents="none" style={[styles.parentLayout, { opacity: fadeAnim }]}>
      <View style={styles.button}>
        <Animated.View style={{ width: '7.5%', transform: [{ scale: pulseAnim }] }}>
          <CustomImage width="100%" aspectRatio={1} resizeMode="contain" source={assets.notifications.diamond} />
        </Animated.View>
        <CustomText
          style={{ width: '90%', marginBottom: '0.8%', letterSpacing: 0.5, fontSize: scale(14) }}
          bold
          noDefaultMargin
          white
          text={getMainStoryEvent(session)?.title}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { width: '88%', alignSelf: 'center', position: 'absolute', top: '6%' },
  button: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#202020FE',
    paddingVertical: '5%',
    paddingHorizontal: '6%',
    borderRadius: scale(40),
  },
});
