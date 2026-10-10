import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, I18nManager, Image, StyleSheet, ToastAndroid, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import assets from '../../assets';
import { GlobalContext } from '../../state/GlobalProvider';
import { retrieveItem, storeItem } from '../../state/storage';
import { playAnimation } from '../../theme/animation';
import { isGameScreen, MainStackParamList } from '../../navigation/types';

type Props = StackScreenProps<MainStackParamList, 'splash'>;

const DEV_SEQUENCE = 'lrlrlrlrlr';

/**
 * Studio splash: the logo row fades in while the "o" spins a full turn, then the
 * "best experienced with headphones" card fades in and out before the game routes on.
 */
export default function SplashScreen({ navigation }: Props) {
  const { session, launchScreen, locked } = useContext(GlobalContext);
  const [logoAnim] = useState(() => new Animated.Value(0));
  const [cardAnim] = useState(() => new Animated.Value(0));
  const [status, setStatus] = useState<'idle' | 'running' | 'finished'>('idle');
  const [secret, setSecret] = useState('');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Start once progress has been loaded.
  useEffect(() => {
    if (status !== 'idle' || !launchScreen || !session || !locked) return;
    setStatus('running');
    timers.current.push(setTimeout(() => playAnimation(logoAnim, 1.2, 2400), 200));
    timers.current.push(
      setTimeout(() => {
        playAnimation(cardAnim, 1, 1600);
        timers.current.push(setTimeout(() => playAnimation(cardAnim, 0, 600), 2100));
      }, 2400),
    );
    timers.current.push(setTimeout(() => setStatus('finished'), 5800));
  }, [status, launchScreen, session, locked, logoAnim, cardAnim]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Route on once the animation is over.
  useEffect(() => {
    if (status !== 'finished' || !session || !launchScreen) return;
    (async () => {
      const started = await retrieveItem('started');
      if (session.episode !== 0) {
        navigation.replace('title', { nextScreen: launchScreen });
      } else if (session.objective === 0 && session.checkpoint === 0 && started !== 'true') {
        navigation.replace('login');
      } else if (isGameScreen(launchScreen)) {
        navigation.replace('game', { screen: launchScreen });
      } else {
        navigation.replace(launchScreen as any);
      }
    })();
  }, [status, session, launchScreen, navigation]);

  // Hidden developer switch: tap left/right halves of the screen in sequence.
  useEffect(() => {
    if (!secret.endsWith(DEV_SEQUENCE)) return;
    setSecret('');
    storeItem('dev', 'true');
    ToastAndroid.show('Enabled dev mode', ToastAndroid.SHORT);
  }, [secret]);

  const techy = <CustomImage height="100%" aspectRatio={2.14} source={assets.splash.techy} />;
  const nic = <CustomImage height="100%" aspectRatio={1.21} source={assets.splash.nic} />;

  return (
    <View style={styles.parentLayout}>
      <Animated.View
        style={[
          styles.container,
          { opacity: logoAnim.interpolate({ inputRange: [0, 1, 1.2], outputRange: [0.2, 1, 0] }) },
        ]}>
        {I18nManager.isRTL ? nic : techy}
        <Animated.View
          style={{
            height: '43.38%',
            aspectRatio: 1,
            marginTop: '1%',
            transform: [
              { rotate: logoAnim.interpolate({ inputRange: [0, 1, 1.2], outputRange: ['0deg', '360deg', '360deg'] }) },
            ],
          }}>
          <CustomImage height="100%" width="100%" source={assets.splash.o} resizeMode="contain" />
        </Animated.View>
        {I18nManager.isRTL ? techy : nic}
      </Animated.View>
      <Animated.View
        style={{ position: 'absolute', top: '30%', alignSelf: 'center', height: '40%', aspectRatio: 1, opacity: cardAnim }}>
        <Image style={{ width: '100%', height: '100%', resizeMode: 'contain' }} source={assets.splash.betterexp} />
      </Animated.View>
      <View style={[StyleSheet.absoluteFill, { flexDirection: 'row' }]}>
        <CustomButton activeOpacity={1} style={{ height: '100%', width: '50%' }} onPress={() => setSecret(s => s + 'l')} silent />
        <CustomButton activeOpacity={1} style={{ height: '100%', width: '50%' }} onPress={() => setSecret(s => s + 'r')} silent />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#070A0C' },
  container: { height: '9%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});
