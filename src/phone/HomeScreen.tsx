import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import CustomImage from '../components/CustomImage';
import CustomText from '../components/CustomText';
import theme from '../theme/theme';
import { scale } from '../theme/scale';
import { createAnimation } from '../theme/animation';
import { getAppLogo } from '../assets/images';
import { GlobalContext } from '../state/GlobalProvider';
import { getCheckpoint, isAppVisible, phones } from '../content';
import { getGeneral } from '../content/general';
import { PhoneName } from '../content/types';
import SwipeHelp from './SwipeHelp';

const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
};

/** Home screen: a four-column grid of app icons with unread badges. */
export default function HomeScreen({ phone, setNotiBarColor }: { phone: PhoneName; setNotiBarColor: (c: string) => void }) {
  const navigation = useNavigation<any>();
  const { session, notifications } = useContext(GlobalContext);
  const [showHelp, setShowHelp] = useState(false);
  const [highlightApp] = useState<string | null>(null);
  const [blinkAnim] = useState(() => new Animated.Value(1));

  useFocusEffect(
    useCallback(() => {
      setNotiBarColor((theme as any)[phone].homescreen.colors.notificationBar);
    }, [phone, setNotiBarColor]),
  );

  const apps = useMemo(() => {
    const config = phones[phone].apps;
    return Object.keys(config)
      .filter(id => isAppVisible(config[id], session))
      .map(id => ({ id, name: config[id].name, image: getAppLogo(id) }));
  }, [phone, session]);

  useEffect(() => {
    setShowHelp(phone === 'herphone' && !!session && !!getCheckpoint(session)?.swipeHelp);
  }, [phone, session]);

  useEffect(() => {
    if (!highlightApp) return;
    const loop = Animated.loop(
      Animated.sequence([
        createAnimation(blinkAnim, 0.1, 600, Easing.linear),
        createAnimation(blinkAnim, 1, 600, Easing.linear),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [highlightApp, blinkAnim]);

  const fillers = (4 - (apps.length % 4)) % 4;

  return (
    <View style={styles.parentLayout} onTouchMove={() => setShowHelp(false)}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: (theme as any)[phone].homescreen.colors.background }]} />
      <View style={styles.dock}>
        {apps.map(app => (
          <CustomButton
            key={app.id}
            activeOpacity={0.6}
            style={styles.app}
            onPress={() => {
              navigation.navigate(app.id, { screen: undefined, params: undefined, number: null });
              setNotiBarColor((theme as any)[phone]?.[app.id]?.colors?.notificationBar ?? '#000');
            }}>
            <Animated.View style={[styles.icon, { opacity: highlightApp === app.id ? blinkAnim : 1 }]}>
              <CustomImage style={shadow} width="100%" height="100%" source={app.image} resizeMode="contain" />
            </Animated.View>
            <CustomText
              style={{ ...shadow, fontSize: scale(13), marginTop: '10%' }}
              numberOfLines={2}
              center
              bold
              white
              text={getGeneral('apps', app.id)}
            />
            {notifications[phone].filter(n => n.app === app.id).length > 0 ? <View style={styles.badge} /> : null}
          </CustomButton>
        ))}
        {Array.from({ length: fillers }).map((_, index) => (
          <View key={`filler-${index}`} style={styles.app} />
        ))}
      </View>
      {showHelp ? <SwipeHelp text={getGeneral('gameplay', 'swipe_screens')} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '4.5%' },
  dock: { width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap' },
  app: {
    width: '24%',
    aspectRatio: 0.75,
    marginRight: '0.95%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: '4%',
    zIndex: 1,
  },
  icon: {
    width: '82%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(14),
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: '2%',
    right: '2%',
    width: '21%',
    aspectRatio: 1,
    borderRadius: scale(100),
    backgroundColor: theme.colors.red,
    opacity: 1,
    elevation: 5,
  },
});
