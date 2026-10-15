import React from 'react';
import { Dimensions, I18nManager, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ArrowRight, EyeOff, X } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getGeneral } from '../../content/general';
import { PhoneName } from '../../content/types';

const { width: W } = Dimensions.get('screen');
const SIDE_PADDING = (W * 5.6) / 100;

type Props = {
  phone: PhoneName;
  showBack?: boolean;
  /** Home screen only: shortcut to the hidden album. */
  showEye?: boolean;
  title?: string;
  setNotiBarColor?: (c: string) => void;
};

/** Gallery title bar: back arrow (or the hidden-album eye), app name and the close button. */
export default function Header({ phone, showBack, showEye, title, setNotiBarColor }: Props) {
  const navigation = useNavigation<any>();
  const colors = (theme as any)[phone].gallery.colors.header;
  const Back = I18nManager.isRTL ? ArrowRight : ArrowLeft;

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderColor: colors.items }]}>
      <CustomImage style={{ position: 'absolute' }} width="100%" height="100%" source={assets.gallery.header} />
      <View style={styles.leftContainer}>
        {showBack ? (
          <CustomButton
            activeOpacity={0.6}
            onPress={() => navigation.goBack()}
            style={[styles.button, { alignItems: 'flex-start', paddingLeft: SIDE_PADDING }]}>
            <Back size={scale(32)} color={colors.items} />
          </CustomButton>
        ) : showEye ? (
          <CustomButton
            activeOpacity={0.6}
            onPress={() => navigation.navigate('hidden')}
            style={[styles.button, { alignItems: 'flex-start', paddingLeft: SIDE_PADDING }]}>
            <EyeOff size={scale(26)} color={colors.items} />
          </CustomButton>
        ) : null}
      </View>
      <View style={styles.middleContainer}>
        <CustomText center white bold variant={title ? 'text' : 'h4'} text={title ?? getGeneral('apps', 'gallery')} />
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
