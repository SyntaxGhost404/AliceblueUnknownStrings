import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { Phone as PhoneIcon } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { createAnimation, playAnimation } from '../../theme/animation';
import { getContactImage } from '../../assets/images';
import { PhoneName } from '../../content/types';
import { CallContext, CallOption, getFormattedTime } from './CallProvider';

const { width: W, height: H } = Dimensions.get('screen');
const OPTIONS_TIME = 8000;
const SHOW_TIME = 400;
const RESIZE_TIME = 450;

/** Caller avatar with a "voice" pulse, the call timer and the live caption. */
function Listen() {
  const { ongoing, status, elapsed, caption } = useContext(CallContext);
  const [voice] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!caption) {
      voice.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        createAnimation(voice, 1.2, 220, Easing.linear),
        createAnimation(voice, 1, 260, Easing.linear),
        createAnimation(voice, 1.1, 180, Easing.linear),
        createAnimation(voice, 1, 200, Easing.linear),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [caption, voice]);

  const color = status === 'ended' ? theme.colors.red : '#FFFFFF55';
  const speaker = caption?.speaker && caption.speaker !== 'player' ? caption.speaker : ongoing?.contact;

  return (
    <View style={styles.listen}>
      <View style={styles.left}>
        <View style={styles.meta}>
          <PhoneIcon fill={color} strokeWidth={0} size={scale(12)} />
          <CustomText noDefaultMargin color={color} bold variant="small" text={getFormattedTime(elapsed)} />
        </View>
        <View style={styles.characterWrapper}>
          <View style={styles.character}>
            <Animated.View
              style={{
                width: '100%',
                aspectRatio: 1,
                borderRadius: scale(200),
                backgroundColor: '#FFFFFF44',
                transform: [
                  { scale: voice.interpolate({ inputRange: [1, 1.1, 1.2, 2], outputRange: [0.75, 0.9, 1, 1.2] }) },
                ],
              }}
            />
            <CustomImage style={styles.image} width="75%" aspectRatio={1} source={getContactImage(speaker)} />
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <CustomText bold variant="caption" color="#FFFFFFDD" noDefaultMargin text={caption?.text} />
      </View>
    </View>
  );
}

/** Timed replies: a shrinking bar counts down; when it runs out a reply is picked at random. */
function Options({ data }: { data: CallOption[] }) {
  const { chooseOption } = useContext(CallContext);
  const [duration] = useState(() => new Animated.Value(1));
  const [barOpacity] = useState(() => new Animated.Value(0));
  const [optionAnims] = useState(() => data.map(() => new Animated.Value(0)));
  const chosen = useRef(false);

  const select = (index: number) => {
    if (chosen.current) return;
    chosen.current = true;
    optionAnims.forEach((anim, i) => playAnimation(anim, i === index ? 1 : 0, 600));
    playAnimation(barOpacity, 0, 600);
    setTimeout(() => {
      playAnimation(optionAnims[index], 0, 600);
      setTimeout(() => chooseOption(index), 600);
    }, 800);
  };

  useEffect(() => {
    playAnimation(duration, 0, OPTIONS_TIME, Easing.linear);
    optionAnims.forEach(anim => playAnimation(anim, 0.35, SHOW_TIME));
    playAnimation(barOpacity, 1, SHOW_TIME);
    const timeout = setTimeout(() => select(Math.floor(Math.random() * data.length)), OPTIONS_TIME);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.options, { justifyContent: data.length > 1 ? 'space-between' : 'center' }]}>
      {data.map((option, index) => (
        <React.Fragment key={index}>
          <Animated.View style={[styles.option, { opacity: optionAnims[index].interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 1, 1] }) }]}>
            <CustomButton activeOpacity={0.9} onPress={() => select(index)}>
              <CustomText center variant="subtext" color="#FFFFFF" text={option.text} />
            </CustomButton>
          </Animated.View>
          {index === 0 ? (
            <Animated.View
              style={{
                width: '60%',
                height: scale(1.5),
                backgroundColor: '#FFFFFF22',
                borderRadius: scale(40),
                opacity: barOpacity,
                transform: [{ scaleX: duration }],
              }}
            />
          ) : null}
        </React.Fragment>
      ))}
    </View>
  );
}

/** The call, minimised: a card floating above the phone while the player keeps browsing. */
export default function FloatingCall(_: { phone: PhoneName }) {
  const { status, options } = useContext(CallContext);
  const LISTEN_H = H * 0.09;
  const OPTIONS_H = H * 0.2;
  const [height] = useState(() => new Animated.Value(LISTEN_H));
  const [fade] = useState(() => new Animated.Value(1));

  useEffect(() => {
    playAnimation(height, options?.length ? LISTEN_H + OPTIONS_H : LISTEN_H, RESIZE_TIME, undefined, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  useEffect(() => {
    if (status !== 'ended') return;
    const out = setTimeout(() => playAnimation(fade, 0, 600, undefined, false), 1800);
    return () => clearTimeout(out);
  }, [status, fade]);

  return (
    <Animated.View style={[styles.parentLayout, { bottom: '4%', width: W * 0.9, height, opacity: fade }]}>
      <View style={{ width: W * 0.9, height: LISTEN_H }}>
        <Listen />
      </View>
      {options?.length ? (
        <View style={{ width: W * 0.9, height: OPTIONS_H }}>
          <Options data={options} />
        </View>
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
  listen: {
    width: '100%',
    height: '100%',
    paddingHorizontal: '3.5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    width: '25%',
    height: '60%',
    backgroundColor: '#112522',
    borderRadius: scale(200),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  meta: { width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center', paddingLeft: '6%' },
  characterWrapper: { width: '50%', height: '100%', justifyContent: 'center', alignItems: 'flex-end' },
  character: { width: '100%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginRight: '4%' },
  image: { position: 'absolute', borderRadius: scale(100), overflow: 'hidden' },
  right: { width: '72%', height: '90%', justifyContent: 'center' },
  options: { width: '100%', height: '100%', paddingHorizontal: '6%', alignItems: 'center' },
  option: { width: '100%', justifyContent: 'center', alignItems: 'center' },
});
