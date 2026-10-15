import React, { useContext, useEffect, useRef, useState } from 'react';
import { Linking, ScrollView, Share, StyleSheet, View } from 'react-native';
import {
  AlignCenter,
  CheckCircle2,
  ChevronRight,
  CloudOff,
  Copy,
  Globe,
  HeartHandshake,
  LucideIcon,
  Music,
  RotateCcw,
  Share2,
  SquareArrowOutUpRight,
  Star,
  Volume2,
} from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { GlobalContext } from '../../state/GlobalProvider';
import { useGameUI } from '../../navigation/GameUIContext';
import { episodeCount, getEpisode } from '../../content';
import { getGeneral } from '../../content/general';
import { PhoneName, Session } from '../../content/types';
import { SOCIAL_LINKS } from '../../config';
import { EXTRA_SOCIAL_LINKS, SHARE_MESSAGE, SHOW_SHOP_BANNERS, TRACKER_LINK } from '../../content/mock/settings';
import pkg from '../../../package.json';
import Header from './Header';
import { copyText } from './clipboard';

type Props = { navigation: any; phone: PhoneName };

type Row = {
  Icon: LucideIcon;
  variant: 'switch' | 'button';
  text: string;
  value?: boolean;
  onPress: () => void;
};

const socialImages = assets.socials as Record<string, any>;
const socials = [...SOCIAL_LINKS, ...EXTRA_SOCIAL_LINKS];

const t = (key: string) => getGeneral('settings', key);

const openLink = (url: string) => {
  if (url) Linking.openURL(url).catch(() => {});
};

/** The story has run out of released content (last checkpoint of the last objective of the last episode). */
const isAtContentEnd = (session: Session | null) => {
  if (!session) return false;
  const last = episodeCount() - 1;
  if (session.episode !== last) return session.episode > last;
  const objectives = getEpisode(last).objectives;
  if (session.objective !== objectives.length - 1) return session.objective > objectives.length - 1;
  return session.checkpoint >= objectives[session.objective].checkpoints.length - 1;
};

/** Settings list: shop banners, account, audio switches, support rows, community links, version. */
export default function Home({ navigation, phone }: Props) {
  const { session, user, musicEnabled, setMusicEnabled, soundsEnabled, setSoundsEnabled } = useContext(GlobalContext);
  const { showOverlay } = useGameUI();
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colors = (theme as any)[phone].settings.colors;

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const handleCopy = () => {
    if (!user) return;
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyText(user.id);
    setCopied(true);
    copyTimer.current = setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: SHARE_MESSAGE });
    } catch (e: any) {
      console.log(e?.message);
    }
  };

  // Rating needs a store listing; the row is drawn like the reference but does nothing yet.
  const rows: Row[] = [
    { Icon: Music, variant: 'switch', text: t('music'), value: !!musicEnabled, onPress: () => setMusicEnabled(!musicEnabled) },
    { Icon: Volume2, variant: 'switch', text: t('sound'), value: !!soundsEnabled, onPress: () => setSoundsEnabled(!soundsEnabled) },
    { Icon: Share2, variant: 'button', text: t('share'), onPress: handleShare },
    { Icon: Star, variant: 'button', text: t('rate_game'), onPress: () => {} },
    { Icon: RotateCcw, variant: 'button', text: t('reset_progress'), onPress: () => showOverlay('resetProgress') },
    { Icon: HeartHandshake, variant: 'button', text: t('need_help'), onPress: () => showOverlay('needHelp') },
    { Icon: AlignCenter, variant: 'button', text: t('credits'), onPress: () => showOverlay('credits', 'normal') },
  ];

  const banners = SHOW_SHOP_BANNERS;

  return (
    <View style={[styles.parentLayout, { backgroundColor: colors.background }]}>
      <Header navigation={navigation} phone={phone} />
      <ScrollView style={{ width: '100%' }} scrollIndicatorInsets={{ right: 1 }} contentContainerStyle={styles.scroll}>
        <View style={styles.settingsContainer}>
          {banners && isAtContentEnd(session) ? (
            <CustomButton activeOpacity={0.6} style={styles.newepisode} onPress={() => showOverlay('newEpisodeModal')}>
              <CustomImage width="100%" height="100%" source={assets.settings.newepisode} />
            </CustomButton>
          ) : null}
          {banners ? (
            <View style={styles.shop}>
              <CustomImage style={{ ...StyleSheet.absoluteFill, opacity: 0.12 }} source={assets.settings.shopbg} resizeMode="cover" />
              <CustomButton activeOpacity={0.6} style={styles.saverpack} onPress={() => {}}>
                <CustomImage width="100%" height="100%" source={assets.settings.saverpack} />
              </CustomButton>
              <CustomButton activeOpacity={0.6} style={styles.sidetrails} onPress={() => {}}>
                <CustomImage width="100%" height="100%" source={assets.settings.sidetrails} />
              </CustomButton>
              <CustomButton activeOpacity={0.6} style={styles.removeads} onPress={() => {}}>
                <CustomImage width="100%" height="100%" source={assets.settings.removeads} />
              </CustomButton>
            </View>
          ) : null}
          {user ? (
            <CustomButton
              style={[styles.settingItem, { justifyContent: 'center', paddingVertical: '2%', marginTop: '1%' }]}
              onPress={handleCopy}>
              <CustomText
                noDefaultMargin
                style={{ marginRight: '2%', marginBottom: '1%' }}
                variant="caption"
                color={theme.colors.darkerGray}
                text={t('user_id') + ': ' + user.id}
              />
              {copied ? (
                <CheckCircle2 size={scale(16)} color={theme.colors.darkerGray} />
              ) : (
                <Copy size={scale(16)} color={theme.colors.darkerGray} />
              )}
            </CustomButton>
          ) : null}
          <CustomButton activeOpacity={0.6} style={styles.settingItem} onPress={() => showOverlay('cloudSaves')}>
            <View style={styles.leftContainer}>
              <Globe size={scale(25)} color={theme.colors.white} />
              <CustomText
                noDefaultMargin
                style={{ marginLeft: '4%', marginBottom: '0.5%' }}
                white
                text={user ? t('linked_acc') : t('link_acc')}
              />
            </View>
            {user ? (
              <CustomImage
                width="12%"
                aspectRatio={1}
                style={{ marginRight: '-2.3%' }}
                source={user.provider === 'apple' ? socialImages.apple : socialImages.google}
              />
            ) : (
              <CloudOff size={scale(22)} color={theme.colors.red} />
            )}
          </CustomButton>
          {rows.map(({ Icon, variant, text, value, onPress }, index) => (
            <CustomButton key={index} activeOpacity={0.6} style={styles.settingItem} onPress={onPress}>
              <View style={styles.leftContainer}>
                <Icon size={scale(25)} color={theme.colors.white} />
                <CustomText noDefaultMargin style={{ marginLeft: '4%', marginBottom: '0.5%' }} white text={text} />
              </View>
              {variant === 'switch' ? (
                <CustomText white noDefaultMargin text={value ? t('on') : t('off')} />
              ) : (
                <ChevronRight size={scale(22)} color={theme.colors.white} />
              )}
            </CustomButton>
          ))}
          <CustomText
            center
            bold
            color={theme.colors.accent}
            variant="subtext"
            text={t('episode_info')}
            style={{ marginRight: '2%', marginTop: '4%', marginBottom: 0 }}
          />
          <CustomButton activeOpacity={0.6} style={styles.trackProgress} onPress={() => openLink(TRACKER_LINK)}>
            <CustomText
              center
              bold
              color={theme.colors.darkGray}
              variant="caption"
              text={t('track_progress')}
              style={{ marginRight: '2%', flexShrink: 0 }}
            />
            <SquareArrowOutUpRight size={scale(16)} strokeWidth={scale(1.25)} color={theme.colors.darkGray} />
          </CustomButton>
          <View style={styles.socials}>
            {socials.map(item => (
              <CustomButton key={item.name} activeOpacity={0.6} style={styles.social} onPress={() => openLink(item.link)}>
                <CustomImage
                  style={{ opacity: 0.6 }}
                  width="50%"
                  aspectRatio={1}
                  resizeMode="contain"
                  source={socialImages[item.name]}
                />
              </CustomButton>
            ))}
          </View>
          <CustomText variant="subtext" center color={theme.colors.darkGray} text={t('version') + ': ' + pkg.version} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, width: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' },
  scroll: { width: '100%', paddingBottom: '10%' },
  settingsContainer: {
    width: '100%',
    marginTop: '1%',
    paddingHorizontal: theme.padding as any,
    paddingVertical: '2%',
    alignItems: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    width: '96%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '2.5%',
  },
  leftContainer: { width: '60%', flexDirection: 'row', alignItems: 'center' },
  shop: {
    width: '100%',
    backgroundColor: '#FFFFFF00',
    padding: '2%',
    borderRadius: scale(40),
    marginBottom: '3%',
    overflow: 'hidden',
    alignItems: 'center',
  },
  newepisode: { width: '100%', aspectRatio: 2.85, marginBottom: '3%' },
  saverpack: { width: '100%', aspectRatio: 3.42, marginVertical: '1%' },
  sidetrails: { width: '100%', aspectRatio: 4.75, marginVertical: '1%' },
  removeads: { width: '100%', aspectRatio: 4.75, marginVertical: '1%' },
  trackProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: '4%',
    paddingHorizontal: scale(10),
    borderRadius: scale(100),
    borderWidth: scale(0.6),
    borderColor: theme.colors.darkGray,
  },
  socials: { width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' },
  social: {
    width: '10%',
    aspectRatio: 1,
    marginHorizontal: scale(6),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(100),
    borderWidth: scale(0.75),
    borderColor: theme.colors.darkGray,
  },
});
