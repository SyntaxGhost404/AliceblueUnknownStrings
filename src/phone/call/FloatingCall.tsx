import React, { useContext, useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import { scale } from '../../theme/scale';
import { playAnimation } from '../../theme/animation';
import { CallReply } from '../../content/mock/callTypes';
import { PhoneName } from '../../content/types';
import { CallContext, CallStateContext } from './callContext';
import Listen from './Listen';
import Options from './Options';

const { width: W, height: H } = Dimensions.get('screen');
const CARD_W = W * 0.9;
const OPTIONS_H = H * 0.2;
const LISTEN_H = H * 0.09;
const RESIZE_TIME = 450;
const SHOW_TIME = 250;
const NO_OPTIONS: CallReply[] = [];

/**
 * The call, minimised: a card floating above the phone while the player keeps browsing. It grows
 * to fit the timed replies and fades away after the call ends; tapping it reopens the call screen.
 */
export default function FloatingCall({ phone }: { phone: PhoneName }) {
  const navigation = useNavigation<any>();
  const { status, setMode } = useContext(CallContext);
  const { options } = useContext(CallStateContext);
  const [width] = useState(() => new Animated.Value(CARD_W));
  const [height] = useState(() => new Animated.Value(LISTEN_H));
  const [fade] = useState(() => new Animated.Value(1));
  const [optionsFade] = useState(() => new Animated.Value(1));
  const [optionsVisible, setOptionsVisible] = useState(false);
  const hasOptions = !!options?.length;

  // Replies arrive: grow, then fade them in. Replies go: fade out, then shrink back.
  useEffect(() => {
    if (hasOptions) {
      playAnimation(width, CARD_W, RESIZE_TIME, undefined, false);
      playAnimation(height, LISTEN_H + OPTIONS_H, RESIZE_TIME, undefined, false);
      const grown = setTimeout(() => {
        setOptionsVisible(true);
        playAnimation(optionsFade, 1, SHOW_TIME);
      }, RESIZE_TIME);
      return () => clearTimeout(grown);
    }
    playAnimation(optionsFade, 0, SHOW_TIME);
    playAnimation(width, CARD_W, RESIZE_TIME, undefined, false);
    playAnimation(height, LISTEN_H, RESIZE_TIME, undefined, false);
    const shrunk = setTimeout(() => setOptionsVisible(false), RESIZE_TIME);
    return () => clearTimeout(shrunk);
  }, [hasOptions, width, height, optionsFade]);

  useEffect(() => {
    if (status !== 'ended') return;
    const out = setTimeout(() => playAnimation(fade, 0, 600, undefined, false), 1800);
    return () => clearTimeout(out);
  }, [status, fade]);

  const expand = () => {
    setMode('app');
    navigation.navigate(phone, { screen: 'call', params: { incoming: true } });
  };

  return (
    <Animated.View style={[styles.parentLayout, { bottom: '4%', width, height, opacity: fade }]}>
      <View style={{ width: CARD_W, height: LISTEN_H }}>
        <CustomButton silent activeOpacity={0.9} style={styles.listen} onPress={expand}>
          <Listen />
        </CustomButton>
      </View>
      {optionsVisible ? (
        <Animated.View style={{ width: CARD_W, height: OPTIONS_H, opacity: optionsFade }}>
          <Options data={options ?? NO_OPTIONS} />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  parentLayout: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#031815',
    borderRadius: scale(20),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    zIndex: 450,
  },
  listen: { width: '100%', height: '100%' },
});
