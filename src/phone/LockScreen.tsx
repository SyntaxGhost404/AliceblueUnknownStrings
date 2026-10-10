import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import CustomText from '../components/CustomText';
import theme from '../theme/theme';
import { scale } from '../theme/scale';
import { GlobalContext } from '../state/GlobalProvider';
import { PhoneName } from '../content/types';
import Notification from './Notification';

type Props = {
  navigation: StackNavigationProp<any>;
  phone: PhoneName;
  setPhoneOff: (v: boolean) => void;
  showPasslock: boolean;
  setShowPasslock: (v: boolean) => void;
  setNotiBarColor: (c: string) => void;
  setIsLockscreen: (v: boolean) => void;
};

/** Lock screen: big clock and date, then the notifications waiting on this phone. */
export default function LockScreen(props: Props) {
  const { navigation, phone, showPasslock, setShowPasslock, setNotiBarColor, setIsLockscreen, setPhoneOff } = props;
  const { time, date, notifications, locked, setLocked } = useContext(GlobalContext);
  const [dateAnim] = useState(() => new Animated.Value(1));

  useFocusEffect(
    useCallback(() => {
      setIsLockscreen(true);
      setNotiBarColor((theme as any)[phone].lockscreen.colors.notificationBar);
      return () => setIsLockscreen(false);
    }, [phone, setIsLockscreen, setNotiBarColor]),
  );

  useEffect(() => {
    if (notifications[phone].length > 0) setPhoneOff(false);
  }, [notifications, phone, setPhoneOff]);

  const openNotification = (app: string, screen: string, params: any) => {
    if (locked?.[phone]) {
      setShowPasslock(true);
      return;
    }
    setLocked(prev => ({ ...(prev ?? { myphone: false, herphone: true }), [phone]: false }));
    navigation.replace('homescreen', params);
    navigation.navigate(screen, params);
    setNotiBarColor((theme as any)[phone]?.[app]?.colors?.notificationBar ?? '#000');
  };

  return (
    <View
      style={[
        styles.parentLayout,
        { backgroundColor: (theme as any)[phone].lockscreen.colors.background, justifyContent: 'flex-start' },
      ]}>
      {!showPasslock ? (
        <Animated.View style={[styles.datetimeContainer, { opacity: dateAnim }]}>
          <CustomText noDefaultMargin variant="h1" white text={time.slice(0, 5)} style={{ fontSize: scale(74) }}>
            <CustomText noDefaultMargin variant="subtext" white text={' ' + time.slice(-2)} />
          </CustomText>
          <CustomText variant="text" white text={date} />
        </Animated.View>
      ) : null}
      {!showPasslock ? (
        <View style={styles.notifications}>
          {notifications[phone].map(n => (
            <Notification
              key={n.id}
              phone={phone}
              navigate={(screen, params) => openNotification(n.app, screen, params)}
              hideBorder
              notiBGColor="#02020277"
              type={n.type}
              caller={n.caller}
              app={n.app}
              screen={n.screen}
              chatName={n.chatName}
              email={n.email}
              title={n.title}
              subtitle={n.subtitle}
              date={n.date}
              badge={n.badge}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', padding: theme.padding as any },
  datetimeContainer: { justifyContent: 'center', alignItems: 'center', marginTop: '4%' },
  notifications: { marginTop: '12%', width: '100%' },
});
