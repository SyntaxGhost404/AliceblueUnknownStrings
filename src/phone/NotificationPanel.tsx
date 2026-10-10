import React, { useContext } from 'react';
import { I18nManager, Linking, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Music, User, Volume2, X } from 'lucide-react-native';
import CustomButton from '../components/CustomButton';
import CustomImage from '../components/CustomImage';
import CustomText from '../components/CustomText';
import assets from '../assets';
import theme from '../theme/theme';
import { moderateScale, scale } from '../theme/scale';
import { GlobalContext } from '../state/GlobalProvider';
import { ContentContext } from '../state/ContentProvider';
import { getGeneral } from '../content/general';
import { GatherInfo, PhoneName } from '../content/types';
import { useGameUI } from '../navigation/GameUIContext';
import { SOCIAL_LINKS } from '../config';
import Notification from './Notification';

const bulbs = [assets.notifications.bulb1, assets.notifications.bulb2, assets.notifications.bulb3];
const socialIcons = {
  discord: assets.settings['discord-secondary'],
  instagram: assets.settings['instagram-secondary'],
  twitter: assets.settings['twitter-secondary'],
};

type Props = {
  phone: PhoneName;
  closePanel: () => void;
  setNotiBarColor: (color: string) => void;
};

/**
 * Pull-down shade: clock, quick toggles (account, music, sound, close), the desk/phone
 * switcher, the current objective with gathered clues and unlocked hints, then the
 * notification list.
 */
export default function NotificationPanel({ phone, closePanel, setNotiBarColor }: Props) {
  const navigation = useNavigation<any>();
  const {
    session,
    time,
    date,
    hint,
    showAd,
    locked,
    notifications,
    musicEnabled,
    setMusicEnabled,
    soundsEnabled,
    setSoundsEnabled,
    highlightInSuspectBoard,
    gatherInfos,
    triggerAction,
    user,
  } = useContext(GlobalContext);
  const { getMainStoryEvent } = useContext(ContentContext);
  const { setShowCloudSaves } = useGameUI();

  const quickToggles = [
    { key: 'user', func: () => setShowCloudSaves(true), controlVar: true, Component: User },
    { key: 'music', func: () => setMusicEnabled(v => !v), controlVar: !!musicEnabled, Component: Music },
    { key: 'sound', func: () => setSoundsEnabled(v => !v), controlVar: !!soundsEnabled, Component: Volume2 },
    { key: 'close', func: closePanel, controlVar: true, Component: X },
  ];
  void user;

  let switcher = [
    {
      id: 'desk',
      func: () => {
        closePanel();
        navigation.navigate('suspectboard');
      },
      icon: assets.notifications.desk,
      text: getGeneral('gameplay', 'desk'),
    },
    {
      id: 'myphone',
      func: () => {
        closePanel();
        navigation.navigate({ name: 'myphone', params: { screen: locked?.myphone ? 'lockscreen' : 'homescreen' } });
      },
      icon: assets.notifications.smartphone,
      text: getGeneral('gameplay', 'adam'),
    },
    {
      id: 'herphone',
      func: () => {
        closePanel();
        navigation.navigate({ name: 'herphone', params: { screen: locked?.herphone ? 'lockscreen' : 'homescreen' } });
      },
      icon: assets.notifications.smartphone,
      text: getGeneral('gameplay', 'zoey'),
    },
  ];
  if (I18nManager.isRTL) switcher = switcher.reverse();

  const event: any = getMainStoryEvent(session, false);
  const fullEvent: any = getMainStoryEvent(session, true);
  const gather: { infos: GatherInfo[] } | undefined = fullEvent?.gather;
  const remaining = gatherInfos ?? [];
  const gathered = gather ? gather.infos.filter(info => !remaining.find(r => r.id === info.id)) : [];
  const progress = gather && gather.infos.length > 1 ? `(${gather.infos.length - remaining.length}/${gather.infos.length})` : '';
  const hints: string[] = event?.hints ?? [];

  return (
    <View style={styles.parentLayout}>
      <View style={styles.datetimeContainer}>
        <View>
          <CustomText bold noDefaultMargin variant="h5" white text={time.slice(0, 5)} style={{ letterSpacing: 0.1 }}>
            <CustomText bold noDefaultMargin variant="caption" white text={' ' + time.slice(-2)} />
          </CustomText>
          <CustomText style={{ letterSpacing: 0.2 }} color={theme.colors.mediumGray} variant="caption" text={date} noDefaultMargin />
        </View>
        <View style={styles.icons}>
          {quickToggles.map(toggle => (
            <View key={toggle.key} style={[styles.icon, { opacity: toggle.controlVar ? 1 : 0.3 }]}>
              <CustomButton style={styles.touchable} onPress={toggle.func} activeOpacity={0.8}>
                <toggle.Component
                  size={scale(26)}
                  color={toggle.controlVar ? theme.colors.white : theme.colors.darkerGray}
                />
              </CustomButton>
            </View>
          ))}
        </View>
      </View>

      {session && session.episode !== 0 && !fullEvent?.flashback && !event?.tabBarHidden ? (
        <View style={styles.buttonsContainer}>
          {switcher.map(button => {
            const current = phone === button.id;
            const otherPhone = button.id === 'myphone' ? 'myphone' : 'herphone';
            const badge =
              button.id === 'desk'
                ? !!highlightInSuspectBoard
                : !current && notifications[otherPhone].length > 0;
            return (
              <View key={button.id} style={[styles.button, { transform: current ? [] : [{ scale: 0.95 }] }]}>
                <CustomButton
                  style={[styles.touchable, { flexDirection: 'row', paddingHorizontal: '6%', paddingVertical: '4%' }]}
                  onPress={button.func}
                  activeOpacity={0.8}>
                  <CustomImage style={{ opacity: current ? 1 : 0.3 }} width="22%" aspectRatio={1} source={button.icon} />
                  <CustomText
                    style={{ marginLeft: '6%', marginBottom: '1.5%', opacity: current ? 1 : 0.3 }}
                    noDefaultMargin
                    variant="subtext"
                    white
                    text={button.text}
                  />
                  {badge ? <View style={[styles.badge, { [I18nManager.isRTL ? 'left' : 'right']: '12%' }]} /> : null}
                </CustomButton>
              </View>
            );
          })}
        </View>
      ) : null}

      {event && !fullEvent?.flashback ? (
        <View
          style={{
            width: '100%',
            borderWidth: scale(0.4),
            borderColor: '#3c3c3c',
            borderRadius: scale(12),
            padding: '4.5%',
            marginTop: '4%',
          }}>
          <View style={styles.objective}>
            <CustomImage width="7.5%" aspectRatio={1} source={assets.notifications.diamond} />
            <CustomText
              style={{ width: '90%', marginBottom: '0.8%', letterSpacing: 0.5, fontSize: scale(14) }}
              bold
              noDefaultMargin
              white
              text={`${event.title}${progress ? ' ' + progress : ''}`}
            />
          </View>
          <View style={styles.infos}>
            {gathered.map(info => (
              <View key={info.id} style={styles.info}>
                <CustomImage
                  style={{ marginRight: '2%' }}
                  width="6%"
                  aspectRatio={1}
                  resizeMode="contain"
                  source={assets.notifications.bullet}
                />
                <CustomText
                  bold
                  noDefaultMargin
                  style={{ width: '90%', fontSize: scale(13), marginBottom: '1%', color: theme.colors.lightGray }}
                  text={info.text}
                />
              </View>
            ))}
            {gathered.length > 0 ? (
              <View
                style={{
                  height: scale(0.4),
                  width: '99%',
                  backgroundColor: '#3c3c3cAA',
                  marginTop: '2%',
                  alignSelf: 'center',
                }}
              />
            ) : null}
          </View>
          <View style={styles.hints}>
            {hints.slice(0, hint).map((text, index) => (
              <View key={index} style={styles.hint}>
                <CustomImage style={{ marginRight: '2%' }} width="6%" aspectRatio={1} source={bulbs[index]} />
                <CustomText
                  style={{ width: '90%', marginBottom: '1%', fontSize: moderateScale(13) }}
                  color={theme.colors.white}
                  noDefaultMargin
                  text={`${text}`}
                />
              </View>
            ))}
            {hint < 3 && hints.length > hint ? (
              <View style={styles.hintButton}>
                <CustomButton
                  style={{ flexDirection: 'row', alignItems: 'center', width: '80%', paddingVertical: '3%' }}
                  onPress={() => {
                    closePanel();
                    showAd();
                  }}>
                  <CustomText
                    bold
                    color={theme.colors.hintButton}
                    noDefaultMargin
                    variant="subtext"
                    text={getGeneral('gameplay', 'stuck_hint')}
                  />
                  <CustomImage
                    style={{ marginLeft: '1%', marginTop: '0.8%' }}
                    width="5.5%"
                    aspectRatio={1}
                    source={assets.notifications.bulb}
                  />
                </CustomButton>
              </View>
            ) : null}
          </View>
          <View style={styles.socials}>
            {SOCIAL_LINKS.map(social => (
              <CustomButton
                key={social.name}
                style={styles.social}
                onPress={() => {
                  if (social.link) Linking.openURL(social.link);
                }}>
                <CustomImage
                  style={{ opacity: 0.75 }}
                  width="30%"
                  aspectRatio={1}
                  resizeMode="contain"
                  source={socialIcons[social.name]}
                />
              </CustomButton>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.notifications}>
        {notifications[phone].map((n, index) => (
          <Notification
            key={`${n.id}-${index}`}
            phone={phone}
            onAction={action => {
              closePanel();
              triggerAction(action);
            }}
            navigate={(screen, params) => {
              closePanel();
              if (n.app !== 'suspectboard') {
                setNotiBarColor((theme as any)[phone]?.[n.app]?.colors?.notificationBar ?? '#000');
                navigation.navigate(phone, { screen, params });
              } else {
                setNotiBarColor(theme.suspectboard.colors.notificationBar);
                navigation.navigate('suspectboard');
              }
            }}
            type={n.type}
            app={n.app}
            screen={n.screen}
            url={n.url}
            action={n.action}
            chatName={n.chatName}
            caller={n.caller}
            retry={n.retry}
            email={n.email}
            title={n.title}
            subtitle={n.subtitle}
            date={n.date}
            badge={n.badge}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { paddingHorizontal: '6%', justifyContent: 'flex-start', alignItems: 'center' },
  datetimeContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '2%',
  },
  icons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: '100%', width: '50%' },
  icon: {
    width: '26%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(90),
    overflow: 'hidden',
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: scale(0.4),
    borderColor: '#3c3c3c',
    borderRadius: scale(22),
    padding: '2%',
    marginTop: '5%',
  },
  button: { width: '31%', borderRadius: scale(8) },
  touchable: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  objective: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infos: { paddingLeft: '10.1%', marginVertical: '0.5%' },
  info: { flexDirection: 'row', alignItems: 'center', paddingTop: '4%' },
  hints: { paddingLeft: '10.1%', marginTop: '0.5%' },
  hint: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: '1.5%', opacity: 0.55 },
  hintButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: '0.5%',
    paddingRight: '2%',
  },
  socials: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: '4%' },
  social: {
    width: '20%',
    aspectRatio: 1.7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: scale(1),
    borderColor: '#2c2c2c',
    borderRadius: scale(100),
    marginHorizontal: '2%',
  },
  notifications: { width: '100%', marginTop: '4%' },
  badge: {
    position: 'absolute',
    top: '4%',
    width: '9.5%',
    aspectRatio: 1,
    borderRadius: scale(100),
    backgroundColor: theme.colors.red,
    opacity: 0.7,
  },
});
