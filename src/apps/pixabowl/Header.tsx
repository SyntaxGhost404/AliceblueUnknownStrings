import React from 'react';
import { Dimensions, I18nManager, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ArrowRight, X } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getGeneral } from '../../content/general';
import { SELF_USER } from '../../content/mock/pixabowl';
import { PhoneName } from '../../content/types';
import { getAvatar } from './feedData';

const { width: W } = Dimensions.get('screen');
const SIDE_PADDING = (W * 5.6) / 100;

type Props = {
  phone: PhoneName;
  showBack?: boolean;
  /** Feed only: the player's avatar opens their profile. */
  showProfile?: boolean;
  title?: string;
  setNotiBarColor?: (c: string) => void;
};

/** Pixabowl title bar: back arrow (or the player's avatar), app name in the hand-drawn face, close. */
export default function Header({ phone, showBack, showProfile, title, setNotiBarColor }: Props) {
  const navigation = useNavigation<any>();
  const colors = (theme as any)[phone].pixabowl.colors.header;
  const Back = I18nManager.isRTL ? ArrowRight : ArrowLeft;

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderColor: colors.items }]}>
      <CustomImage style={{ position: 'absolute' }} width="100%" height="100%" source={assets.pixabowl.header} />
      <View style={styles.leftContainer}>
        {showBack ? (
          <CustomButton
            activeOpacity={0.6}
            onPress={() => navigation.goBack()}
            style={[styles.button, { alignItems: 'flex-start', paddingLeft: SIDE_PADDING }]}>
            <Back size={scale(32)} color={colors.items} />
          </CustomButton>
        ) : showProfile ? (
          <CustomButton
            activeOpacity={0.6}
            onPress={() => navigation.navigate('profile', { user: SELF_USER })}
            style={[styles.button, { alignItems: 'flex-start', paddingLeft: SIDE_PADDING }]}>
            <CustomImage
              style={{ borderRadius: scale(100) }}
              height="50%"
              aspectRatio={1}
              source={getAvatar(SELF_USER)}
            />
          </CustomButton>
        ) : null}
      </View>
      <View style={styles.middleContainer}>
        <CustomText
          style={{ fontFamily: 'IndieFlower-Regular' }}
          center
          color={colors.items}
          bold
          variant={title ? 'text' : 'h2'}
          text={title ?? getGeneral('apps', 'pixabowl')}
        />
      </View>
      <View style={styles.rightContainer}>
        <CustomButton
          activeOpacity={0.6}
          onPress={() => {
            setNotiBarColor?.((theme as any)[phone].homescreen.colors.notificationBar);
            navigation.popTo('homescreen');
          }}
          style={[styles.button, { alignItems: 'flex-end', paddingRight: SIDE_PADDING }]}>
          <X size={scale(32)} color={colors.items} />
        </CustomButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: '9%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: scale(0),
  },
  leftContainer: { width: '8%', height: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
  middleContainer: { width: '70%', height: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  rightContainer: {
    width: '8%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 0,
  },
  button: { height: '100%', aspectRatio: 1.1, justifyContent: 'center' },
});
