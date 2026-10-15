import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoaderCircle } from 'lucide-react-native';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import { getSuspectBoardObject } from '../../assets/images';
import theme from '../../theme/theme';
import { createAnimation, playAnimation } from '../../theme/animation';
import { scale } from '../../theme/scale';
import { createSound, GameSound } from '../../audio/sound';
import { GlobalContext } from '../../state/GlobalProvider';
import { useGameUI } from '../../navigation/GameUIContext';
import NotificationBar from '../../phone/NotificationBar';
import { getObjective } from '../../content';
import { getGeneral } from '../../content/general';
import { copy, phoneBootLines } from '../../content/mock/modals';
import { getDate, getTime } from '../../utils/date';
import { useTimers } from './hooks';

const { height: SCREEN_H } = Dimensions.get('screen');

const noop = () => {};

/**
 * End of the prologue. The desk dims, the phone from the box lights up when tapped, zooms in
 * and boots (spinner and one status line per beep), then Zoey's lock screen appears, fades
 * out and the game hands over to the title card and "Episode 1". The timings below are the
 * reference build's.
 */
export default function PrologueEnd({ onClose }: { onClose: () => void }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { session, time, soundsEnabled, musicEnabled, setBGColor, triggerAction } = useContext(GlobalContext);
  const { setHideGame } = useGameUI();
  const at = useTimers();
  const [backgroundAnim] = useState(() => new Animated.Value(0));
  const [phoneAnim] = useState(() => new Animated.Value(0));
  const [zoomAnim] = useState(() => new Animated.Value(1));
  const [spinAnim] = useState(() => new Animated.Value(0));
  const [welcomeAnim] = useState(() => new Animated.Value(0));
  const [fadeAnim] = useState(() => new Animated.Value(1));
  const [nameAnim] = useState(() => new Animated.Value(1));
  const [showPhone, setShowPhone] = useState(true);
  const [booting, setBooting] = useState(false);
  const [stage, setStage] = useState(0);
  const started = useRef(false);
  const ikigai = useRef<GameSound | null>(null);
  const beep = useRef<GameSound | null>(null);

  useEffect(() => {
    if (soundsEnabled) {
      createSound('boxrip.mp3', s => {
        if (s !== 'error') s.play(() => s.release());
      });
    }
    ikigai.current = createSound('ikigai.mp3');
    beep.current = createSound('shortbeep.mp3');
    playAnimation(phoneAnim, 1, 1000);
    playAnimation(backgroundAnim, 0.5, 800);
    return () => {
      ikigai.current?.release();
      beep.current?.release();
    };
    // Mount only, like the reference build.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playBeep = (release = false) => {
    if (!soundsEnabled) return;
    beep.current?.play(() => {
      if (release) beep.current?.release();
    });
  };

  const finish = () => {
    setHideGame(true);
    ikigai.current?.stop();
    at(() => {
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'title', params: { nextScreen: 'episode' } }] }),
      );
      // Only the prologue moves on to Episode 1; replaying this scene later leaves the story alone.
      if (!session || session.episode === 0) triggerAction({ app: 'episode', delay: 0 });
      onClose();
    }, 5000);
  };

  /** Runs the whole sequence once the phone is tapped. */
  const startAnim = () => {
    if (started.current) return;
    started.current = true;
    if (musicEnabled) ikigai.current?.play(() => ikigai.current?.release());
    at(() => {
      playAnimation(zoomAnim, 2.8, 2500);
      playAnimation(backgroundAnim, 1, 800);
    }, 100);
    at(() => playBeep(), 2600);
    at(() => {
      Animated.loop(createAnimation(spinAnim, 1, 1000, Easing.linear)).start();
      backgroundAnim.setValue(1);
      setBooting(true);
      setShowPhone(false);
    }, 2700);
    [5200, 7700, 10200, 12700].forEach((ms, i) =>
      at(() => {
        playBeep();
        setStage(i + 1);
      }, ms),
    );
    at(() => {
      playBeep(true);
      setStage(5);
    }, 15500);
    at(() => {
      setBGColor('transparent');
      setStage(6);
      playAnimation(welcomeAnim, 1, 800);
    }, 18000);
    at(() => {
      setStage(7);
      // Colour interpolation can't use the native driver.
      playAnimation(fadeAnim, 0, 2000, Easing.ease, false);
    }, 22000);
    at(() => playAnimation(nameAnim, 0, 2000, Easing.ease), 27000);
    at(finish, 30000);
  };

  const clock = time || getTime('').now;
  const fullHeight = SCREEN_H + insets.top + insets.bottom;
  const objective = session ? getObjective(session) : undefined;

  return (
    <View style={styles.parentLayout}>
      <Animated.View style={[styles.background, { opacity: backgroundAnim }]} />
      {showPhone ? (
        <Animated.View
          onTouchEnd={startAnim}
          style={[styles.phone, { opacity: phoneAnim, transform: [{ scale: zoomAnim }] }]}
        >
          <CustomImage
            source={getSuspectBoardObject('herphone', 'big')}
            width="100%"
            height="100%"
            resizeMode="stretch"
          />
        </Animated.View>
      ) : null}
      {stage >= 6 ? (
        <Animated.View style={{ position: 'absolute', width: '100%', height: fullHeight, opacity: fadeAnim }}>
          <CustomImage source={assets.lockscreen.zoey} width="100%" height="100%" resizeMode="cover" />
          <View style={{ position: 'absolute', width: '100%', height: '100%' }} />
        </Animated.View>
      ) : null}
      {booting && stage < 6 ? (
        <>
          <Animated.View
            style={{
              transform: [{ rotateZ: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
            }}
          >
            <LoaderCircle color="white" size={scale(26)} />
          </Animated.View>
          {phoneBootLines.map((line, i) => (stage === i ? <CustomText key={i} white text={line} /> : null))}
        </>
      ) : null}
      {stage >= 6 ? (
        <>
          <Animated.View style={{ width: '100%', opacity: fadeAnim }}>
            <NotificationBar
              onPanelDownPress={noop}
              showPasslock={false}
              phone="herphone"
              notiBarColor={theme.herphone.lockscreen.colors.notificationBar}
              isLockscreen
              disableNotiBar
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.content,
              {
                backgroundColor: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: ['#00000000', '#00000099'] }),
                height: (fullHeight * 94) / 100,
              },
            ]}
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              <CustomText noDefaultMargin variant="h1" white text={clock.slice(0, 5)} style={{ fontSize: scale(74) }}>
                <CustomText variant="caption" white text={' ' + clock.slice(-2)} />
              </CustomText>
            </Animated.View>
            <Animated.View style={{ opacity: fadeAnim }}>
              <CustomText gray variant="caption" white text={getDate(objective?.date ?? '')} />
            </Animated.View>
            <Animated.View
              style={{
                flexDirection: 'row',
                marginTop: '2%',
                opacity: welcomeAnim,
                transform: [{ scale: welcomeAnim.interpolate({ inputRange: [0, 1], outputRange: [1.2, 1] }) }],
              }}
            >
              <Animated.View style={{ opacity: fadeAnim }}>
                <CustomText white variant="h5" text={copy.welcome} />
              </Animated.View>
              <Animated.View style={{ opacity: nameAnim }}>
                <CustomText white variant="h5" text={getGeneral('gameplay', 'zoey')} />
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' },
  background: { position: 'absolute', height: '100%', width: '100%', backgroundColor: 'black' },
  phone: { width: '50%', aspectRatio: 0.55, justifyContent: 'center', alignItems: 'center' },
  content: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingTop: '12%',
  },
});
