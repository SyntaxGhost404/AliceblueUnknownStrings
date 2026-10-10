import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import moment from 'moment';
import { PhoneCall, PhoneMissed } from 'lucide-react-native';
import CustomButton from '../components/CustomButton';
import CustomImage from '../components/CustomImage';
import CustomText from '../components/CustomText';
import assets from '../assets';
import theme from '../theme/theme';
import { scale } from '../theme/scale';
import { getAppLogo, getContactImage } from '../assets/images';
import { GlobalContext } from '../state/GlobalProvider';
import { getGeneral } from '../content/general';
import { getObjective, getProfileName } from '../content';
import { translateNotificationText } from '../content/notifications';
import contacts from '../content/mock/contacts';
import { GameAction, PhoneName } from '../content/types';
import { CallContext } from './call/CallProvider';

export type NotificationProps = {
  phone: PhoneName;
  navigate: (screen: string, params?: any) => void;
  onAction?: (action: GameAction) => void;
  type?: 'call';
  app: string;
  screen?: string;
  url?: string;
  action?: GameAction;
  chatName?: string;
  caller?: string;
  retry?: boolean;
  email?: string;
  data?: any;
  title?: string;
  subtitle?: string;
  date?: string;
  badge?: number;
  notiBGColor?: string;
  hideBorder?: boolean;
  hideHint?: boolean;
  isObjective?: boolean;
  disabled?: boolean;
};

const keyed = (key: string) => getGeneral('notifications', key);

/**
 * One card in the notification shade, lock screen or pop-up banner. Incoming calls get
 * Accept/Decline pills and a faded caller portrait; everything else deep-links into its app.
 */
export default function Notification(props: NotificationProps) {
  const { phone, app, type, caller } = props;
  const { session, setNotifications, setPopupNotification, triggerAction, setAppsData } = useContext(GlobalContext);
  const { ongoing, startCall } = useContext(CallContext);

  const removeCallNotification = () => {
    setNotifications(prev => ({ ...prev, [phone]: prev[phone].filter(n => n.id !== `call.${caller}`) }));
    setPopupNotification({ myphone: null, herphone: null });
  };

  const addToHistory = (kind: 'incoming' | 'missed') => {
    if (!caller) return;
    const record = {
      name: getProfileName(caller),
      time: session ? getObjective(session)?.date ?? '' : '',
      timestamp: moment().format(),
      type: kind,
      contact: caller,
      number: contacts[caller]?.number,
    };
    setAppsData(prev => ({ ...prev, [phone]: { ...prev[phone], call: [record, ...prev[phone].call] } }));
  };

  const acceptCall = () => {
    removeCallNotification();
    addToHistory('incoming');
    if (caller) startCall(contacts[caller]?.number ?? caller, 'incoming');
    props.navigate(app, { incoming: true });
  };

  const declineCall = () => {
    removeCallNotification();
    addToHistory('missed');
    if (props.retry && caller) {
      triggerAction({ device: phone, app: 'call', caller, retry: true, delay: 2000 });
    }
  };

  const onPress = () => {
    if (props.action) {
      props.onAction?.(props.action);
      return;
    }
    if (type === 'call' || ongoing) return;
    props.navigate(app, {
      screen: props.screen,
      url: props.url,
      params: { chatName: props.chatName, email: props.email, data: props.data },
    });
  };

  const appIcon =
    app === 'suspectboard'
      ? assets.notifications.desk
      : app === 'recovery'
        ? assets.notifications['recovery-white']
        : getAppLogo(app, 'small');
  const appName = app === 'suspectboard' ? 'Office' : getGeneral('apps', app);
  const theirTheme = (theme as any)[phone]?.notifications?.colors ?? {};
  const callColors = { ...(theme as any).myphone.notifications.colors, ...theirTheme };

  return (
    <CustomButton
      disabled={props.disabled || (!!ongoing && type === 'call')}
      activeOpacity={type === 'call' ? 1 : 0.8}
      style={[
        styles.parentLayout,
        {
          borderWidth: props.hideBorder ? 0 : scale(0.45),
          borderColor: '#3c3c3c',
          backgroundColor: props.notiBGColor ?? 'transparent',
        },
      ]}
      onPress={onPress}>
      <View style={styles.content}>
        {!props.isObjective ? (
          <View style={styles.app}>
            <CustomImage
              style={{ marginTop: '0.6%', opacity: 0.8 }}
              width="3.5%"
              resizeMode="contain"
              aspectRatio={1}
              source={appIcon}
            />
            <CustomText style={{ marginLeft: '1%' }} variant="small" color={theme.colors.mediumGray} noDefaultMargin text={appName} />
          </View>
        ) : null}
        <View style={styles.title}>
          <CustomText
            bold
            variant="subtext"
            noDefaultMargin
            color={theme.colors.white}
            numberOfLines={1}
            text={type === 'call' ? getProfileName(caller) : translateNotificationText(props.title)}
          />
        </View>
        <View style={styles.subtitle}>
          <CustomText
            style={{ width: '90%', fontSize: scale(12) }}
            color={theme.colors.mediumGray}
            numberOfLines={1}
            noDefaultMargin
            text={translateNotificationText(props.subtitle)}
          />
          <View style={[styles.badge, { opacity: (props.badge ?? 0) > 1 ? 0.9 : 0 }]}>
            <CustomText bold variant="caption" white text={props.badge} noDefaultMargin />
          </View>
        </View>
        {type === 'call' ? (
          <View style={styles.actions}>
            <CustomButton style={[styles.action, { backgroundColor: callColors.callAccept }]} onPress={acceptCall}>
              <PhoneCall style={{ marginRight: '5%' }} size={scale(14)} color={theme.colors.white} />
              <CustomText style={{ marginBottom: '5%' }} bold variant="caption" white text={keyed('accept')} />
            </CustomButton>
            <CustomButton style={[styles.action, { backgroundColor: callColors.callDecline }]} onPress={declineCall}>
              <PhoneMissed style={{ marginRight: '5%' }} size={scale(14)} color={theme.colors.white} />
              <CustomText style={{ marginBottom: '5%' }} bold variant="caption" white text={keyed('decline')} />
            </CustomButton>
          </View>
        ) : null}
      </View>
      {caller ? (
        <CustomImage
          style={{ position: 'absolute', right: '-10%', borderRadius: scale(200), opacity: 0.1 }}
          height="140%"
          aspectRatio={1}
          source={getContactImage(caller)}
        />
      ) : null}
    </CustomButton>
  );
}

const styles = StyleSheet.create({
  parentLayout: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '4%',
    paddingVertical: '4%',
    marginBottom: '4%',
    borderRadius: scale(10),
    overflow: 'hidden',
  },
  content: { width: '100%', justifyContent: 'space-around', alignItems: 'flex-start' },
  app: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', opacity: 0.6 },
  title: { width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: '1%' },
  subtitle: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', opacity: 0.9 },
  badge: {
    width: '7.5%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c2c2c44',
    borderRadius: scale(100),
  },
  actions: { width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: '3%' },
  action: {
    paddingVertical: '2%',
    paddingHorizontal: '4%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: scale(40),
    marginRight: '4%',
  },
});
