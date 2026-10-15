import React, { useContext, useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import { GlobalContext } from '../../state/GlobalProvider';
import { useGameUI } from '../../navigation/GameUIContext';
import { createSound } from '../../audio/sound';
import { playAnimation } from '../../theme/animation';
import { scale } from '../../theme/scale';
import { copy } from '../../content/mock/modals';
import { useTimers } from './hooks';

/**
 * "Start Episode N" pill that fades in over the game. Pressing it chimes, fades the screen to
 * black, hides the game and moves the story on to the next episode.
 */
export default function StartNextEpisode({ onClose }: { onClose: () => void }) {
  const { session, triggerAction, soundsEnabled } = useContext(GlobalContext);
  const { setHideNavigator } = useGameUI();
  const navigation = useNavigation();
  const later = useTimers();
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [blackAnim] = useState(() => new Animated.Value(0));
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    playAnimation(fadeAnim, 1, 800);
  }, [fadeAnim]);

  const onPress = () => {
    setDisabled(true);
    if (soundsEnabled) {
      createSound('tone.mp3', s => {
        if (s === 'error') return;
        s.setVolume(0.6);
        s.play(() => s.release());
      });
    }
    playAnimation(blackAnim, 1, 800);
    later(() => {
      setHideNavigator(true);
      onClose();
      triggerAction({ app: 'episode', delay: 500 });
      // This build has no scripted episode opening, so the new episode starts from its title card.
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'title', params: { nextScreen: 'episode' } }] }),
      );
    }, 800);
  };

  return (
    <Animated.View pointerEvents="box-none" style={[styles.parentLayout, { opacity: fadeAnim }]}>
      <CustomButton disabled={disabled} style={styles.button} silent onPress={onPress}>
        <CustomText
          gameText
          bold
          noDefaultMargin
          accent
          variant="h2"
          text={`${copy.startEpisode} ${(session?.episode ?? 0) + 1}`}
        />
      </CustomButton>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: 'black', opacity: blackAnim }]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  parentLayout: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  button: {
    position: 'absolute',
    bottom: '8%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0C0C0CFF',
    paddingHorizontal: '9%',
    paddingVertical: '5%',
    borderRadius: scale(100),
  },
});
