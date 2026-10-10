import React, { useCallback, useContext, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, Smartphone, Wifi } from 'lucide-react-native';
import CustomButton from '../components/CustomButton';
import CustomImage from '../components/CustomImage';
import CustomText from '../components/CustomText';
import assets from '../assets';
import theme from '../theme/theme';
import { scale } from '../theme/scale';
import { createAnimation } from '../theme/animation';
import { getAppLogo } from '../assets/images';
import { GlobalContext } from '../state/GlobalProvider';
import { ContentContext } from '../state/ContentProvider';
import { getGeneral } from '../content/general';
import { PhoneName } from '../content/types';

const { height: SCREEN_H } = Dimensions.get('screen');
const BAR_H = (SCREEN_H * 6) / 100;

const batteryIcons = { low: BatteryLow, medium: BatteryMedium, full: BatteryFull, charging: BatteryCharging };

type Props = {
  onPanelDownPress: () => void;
  showPasslock: boolean;
  phone: PhoneName;
  notiBarColor: string;
  isLockscreen: boolean;
  disableNotiBar: boolean;
};

/**
 * Phone status bar: objective diamond and pending-app icons on the left, the phone's
 * owner in the middle, Wi-Fi and battery on the right. Tapping it pulls down the shade.
 */
export default function NotificationBar(props: Props) {
  const { phone, showPasslock, onPanelDownPress } = props;
  const { session, notifications, locked, batteryIcon } = useContext(GlobalContext);
  const { getMainStoryEvent } = useContext(ContentContext);
  const insets = useSafeAreaInsets();
  const [blinkAnim] = useState(() => new Animated.Value(1));
  const blink = useRef<Animated.CompositeAnimation | null>(null);

  // First visit to Zoey's phone: Adam's status bar blinks to show where to switch phones.
  useFocusEffect(
    useCallback(() => {
      const tutorial =
        !showPasslock &&
        session?.episode === 1 &&
        session.objective === 0 &&
        session.checkpoint === 0 &&
        phone === 'myphone' &&
        notifications.herphone.length > 0;
      if (tutorial) {
        blink.current = Animated.loop(
          Animated.sequence([createAnimation(blinkAnim, 0.1, 800), createAnimation(blinkAnim, 1, 800)]),
        );
        blink.current.start();
      } else if (blink.current) {
        blink.current.reset();
        blinkAnim.setValue(1);
      }
    }, [session, phone, notifications, showPasslock, blinkAnim]),
  );

  const event: any = getMainStoryEvent(session, true);
  const apps = [...new Set(notifications[phone].map(n => n.app))];
  const Battery = batteryIcons[batteryIcon] ?? BatteryMedium;
  const showLabel =
    !!session && (session.episode >= 1 || (session.episode === 0 && session.checkpoint >= 1)) && !event?.objectiveHidden;
  const label =
    phone === 'herphone'
      ? getGeneral('gameplay', 'zoey_phone')
      : getGeneral('gameplay', event?.flashback ? 'adam_old_phone' : 'adam_phone');

  return (
    <Animated.View style={{ width: '100%', height: BAR_H + insets.top, backgroundColor: props.notiBarColor }}>
      <CustomButton
        disabled={props.disableNotiBar}
        activeOpacity={locked?.[phone] ? 1 : 0.4}
        onPress={() => {
          if (!locked?.[phone]) onPanelDownPress();
          else if (showPasslock) onPanelDownPress();
        }}
        style={styles.parentLayout}>
        <Animated.View style={[styles.insetContainer, { height: insets.top, opacity: blinkAnim }]} />
        <Animated.View style={[styles.bar, { height: BAR_H, opacity: blinkAnim }]}>
          <View style={styles.container}>
            {event && !event.objectiveHidden && !event.flashback ? (
              <CustomImage style={{ marginRight: '0.5%' }} width="19%" aspectRatio={1} source={assets.notifications.diamond} />
            ) : null}
            {apps.map(app =>
              app === 'suspectboard' ? (
                <CustomImage key={app} style={styles.leftIcon} width="16.5%" aspectRatio={1} source={assets.notifications.desk} />
              ) : app === 'recovery' ? (
                <CustomImage
                  key={app}
                  style={styles.leftIcon}
                  width="14%"
                  aspectRatio={1}
                  source={assets.notifications['recovery-white']}
                />
              ) : (
                <CustomImage
                  key={app}
                  style={styles.leftIcon}
                  resizeMode="contain"
                  source={getAppLogo(app, 'small')}
                  width="15%"
                  aspectRatio={1}
                />
              ),
            )}
            {phone === 'myphone' && notifications.herphone.length > 0 ? (
              <Animated.View>
                <Smartphone style={{ marginLeft: '15%' }} size={scale(15)} color={theme.colors.white} />
              </Animated.View>
            ) : null}
          </View>
          <View style={[styles.container, { justifyContent: 'center' }]}>
            {showLabel ? <CustomText center white variant="small" noDefaultMargin text={label} /> : null}
          </View>
          <View style={[styles.container, { justifyContent: 'flex-end' }]}>
            <Wifi style={styles.leftIcon} size={scale(16)} color={theme.colors.white} />
            <Battery style={styles.rightIcon} color={theme.colors.white} size={scale(20)} />
          </View>
        </Animated.View>
      </CustomButton>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { width: '100%', height: '100%', zIndex: 99, flexDirection: 'column', alignItems: 'center' },
  insetContainer: { width: '100%' },
  bar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.padding as any,
  },
  container: { width: '31%', flexDirection: 'row', alignItems: 'center' },
  leftIcon: { marginLeft: '4%' },
  rightIcon: { marginLeft: '10%', marginTop: '1%' },
});
