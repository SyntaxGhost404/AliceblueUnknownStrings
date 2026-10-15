import React, { useContext, useEffect, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Check, Edit, FlipHorizontal, RotateCw } from 'lucide-react-native';
import Foundation from 'react-native-vector-icons/Foundation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { createAnimation, playAnimation } from '../../theme/animation';
import { getAppImage } from '../../assets/images';
import { GlobalContext } from '../../state/GlobalProvider';
import { isActiveInSession } from '../../content';
import { PhoneName } from '../../content/types';
import useImageAspect from '../mail/useImageAspect';
import BlurOverlay from './BlurOverlay';
import Header from './Header';
import { NEUTRAL, photoOpacity, resolvePhoto } from './photoView';

const { width: W, height: H } = Dimensions.get('screen');
const MAX_HEIGHT = H * 0.4;

// Tools of the edit panel; `mode` is what the panel is showing: 0 = shortcuts, 1 = contrast, 2 = blur.
const TOOLS = [
  { Icon: Foundation, icon: 'contrast' },
  { Icon: MaterialIcons, icon: 'blur-on' },
] as const;

type Props = { phone: PhoneName; route: any; setNotiBarColor: (c: string) => void };

/**
 * Photo viewer with the caption above and an edit panel below: flip, rotate, and contrast and
 * blur sliders (some photos are dark, blurred or mirrored on purpose and have to be put right).
 */
export default function ImageView({ phone, route, setNotiBarColor }: Props) {
  const { session, triggerAction, gatherInfos, handleGatherInfo, setRecoveredApps } = useContext(GlobalContext);
  const photo = resolvePhoto(route.params);
  const colors = (theme as any)[phone].gallery.colors;
  const source = photo ? getAppImage('gallery', photo.image) : undefined;
  const ratio = useImageAspect(source);
  const [mirror, setMirror] = useState(!!photo?.mirror);
  const [mirrorAnim] = useState(() => new Animated.Value(photo?.mirror ? 1 : 0));
  const [rotate, setRotate] = useState(photo?.rotate ?? 0);
  const [rotateAnim] = useState(() => new Animated.Value(0));
  const [mode, setMode] = useState(0);
  const [darken, setDarken] = useState(photo?.darken ?? NEUTRAL);
  const [blur, setBlur] = useState(photo?.blur ?? NEUTRAL);
  const [pulse] = useState(() => new Animated.Value(1));
  const [spotUsed, setSpotUsed] = useState(false);
  const hotspot = photo?.hotspot;
  const canGather = !!hotspot && !spotUsed && isActiveInSession(session, hotspot.start, hotspot.end);
  const id = photo?.id;

  useEffect(() => {
    playAnimation(mirrorAnim, mirror ? 1 : 0, 350);
  }, [mirror, mirrorAnim]);

  useEffect(() => {
    playAnimation(rotateAnim, rotate, 350);
  }, [rotate, rotateAnim]);

  // The contrast tool works on the photo upright.
  useEffect(() => {
    if (mode !== 1) return;
    rotateAnim.setValue(0);
    mirrorAnim.setValue(0);
    setRotate(0);
    setMirror(false);
  }, [mode, rotateAnim, mirrorAnim]);

  // Looking at a photo that holds a clue gathers it.
  useEffect(() => {
    if (!id || !gatherInfos?.some(info => info.id === `gallery:${id}`)) return;
    const timer = setTimeout(() => handleGatherInfo(`gallery:${id}`), 600);
    return () => clearTimeout(timer);
  }, [id, gatherInfos, handleGatherInfo]);

  // Opening a recovered photo clears its mark.
  useEffect(() => {
    if (!id) return;
    setRecoveredApps(prev =>
      prev?.gallery?.includes(id) ? { ...prev, gallery: prev.gallery.filter(photoId => photoId !== id) } : prev,
    );
  }, [id, setRecoveredApps]);

  // The clue spot pulses while it can still be tapped.
  useEffect(() => {
    if (!canGather) return;
    const loop = Animated.loop(
      Animated.sequence([createAnimation(pulse, 0.1, 700, Easing.linear), createAnimation(pulse, 1, 700, Easing.linear)]),
    );
    loop.start();
    return () => {
      loop.stop();
      pulse.setValue(1);
    };
  }, [canGather, pulse]);

  if (!photo) return null;

  const wide = ratio * MAX_HEIGHT > W;
  const dark = Math.abs(NEUTRAL - darken) / NEUTRAL;
  const blurAmount = Math.abs(NEUTRAL - blur);
  const buttonColor = colors.icon.offbackground;

  const shortcuts = [
    { Icon: FlipHorizontal, onPress: () => setMirror(value => !value) },
    { Icon: RotateCw, onPress: () => setRotate(value => value + (mirror ? -1 : 1)) },
    { Icon: Edit, onPress: () => setMode(1) },
  ];

  return (
    <View style={[styles.parentLayout, { backgroundColor: colors.background }]}>
      <Header phone={phone} showBack setNotiBarColor={setNotiBarColor} />
      <CustomText
        center
        variant="subtext"
        white
        style={{ fontStyle: 'italic', marginTop: '10%', padding: theme.padding as any }}
        text={photo.caption}
      />
      <Animated.View
        style={[
          styles.imageContainer,
          {
            [wide ? 'width' : 'height']: wide ? W : MAX_HEIGHT,
            aspectRatio: ratio || undefined,
            backgroundColor: `rgba(0, 0, 0, ${dark})`,
            transform: [
              { rotateY: mirrorAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
              { rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) },
            ],
          } as any,
        ]}>
        <CustomImage width="100%" height="100%" resizeMode="contain" style={{ opacity: photoOpacity(darken) }} source={source} />
        {hotspot ? (
          <CustomButton
            disabled={!canGather}
            onPress={() => {
              setSpotUsed(true);
              triggerAction(hotspot.action);
            }}
            style={{
              position: 'absolute',
              top: hotspot.top as any,
              left: hotspot.left as any,
              width: hotspot.width as any,
              aspectRatio: hotspot.aspectRatio,
            }}>
            <Animated.Image
              style={{ width: '100%', height: '100%', opacity: pulse }}
              resizeMode="contain"
              source={getAppImage('gallery', hotspot.image) as any}
            />
          </CustomButton>
        ) : null}
        {blurAmount !== 0 ? <BlurOverlay amount={blurAmount} /> : null}
      </Animated.View>
      {mode === 0 ? (
        <View style={[styles.actionContainer, { marginTop: '10%' }]}>
          {shortcuts.map(({ Icon, onPress }, index) => (
            <CustomButton key={index} style={[styles.button, { backgroundColor: buttonColor }]} onPress={onPress} activeOpacity={0.6}>
              <Icon size={scale(22)} color={theme.colors.white} />
            </CustomButton>
          ))}
        </View>
      ) : (
        <>
          <View style={styles.slider}>
            <CustomText variant="h4" style={{ width: '14%', textAlign: 'right' }} white text={Math.round(mode === 1 ? darken : blur)} />
            <Slider
              style={{ width: '60%' }}
              minimumValue={0}
              maximumValue={100}
              step={1}
              thumbTintColor={colors.icon.onBackground}
              minimumTrackTintColor={theme.colors.white}
              maximumTrackTintColor={theme.colors.darkGray}
              value={mode === 1 ? darken : blur}
              onValueChange={value => (mode === 1 ? setDarken(value) : setBlur(value))}
            />
            <CustomButton
              style={[styles.button, { marginHorizontal: 0, backgroundColor: buttonColor }]}
              onPress={() => setMode(0)}
              activeOpacity={0.6}>
              <Check size={scale(24)} color={theme.colors.white} />
            </CustomButton>
          </View>
          <View style={styles.actionContainer}>
            {TOOLS.map(({ Icon, icon }, index) => (
              <CustomButton
                key={icon}
                style={[styles.button, { backgroundColor: mode - 1 === index ? colors.icon.onBackground : buttonColor }]}
                onPress={() => setMode(index + 1)}
                activeOpacity={0.6}>
                <Icon name={icon} size={scale(25)} color={theme.colors.white} />
              </CustomButton>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column', justifyContent: 'flex-start' },
  imageContainer: { width: '100%', height: '50%', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  actionContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' },
  button: {
    width: '13%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(100),
    marginHorizontal: '8%',
  },
  slider: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: '4%',
  },
});
