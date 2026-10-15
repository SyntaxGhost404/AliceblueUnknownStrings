import React from 'react';
import { Dimensions, I18nManager, StyleSheet, View } from 'react-native';
import { ArrowLeft, ArrowRight, X } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getGeneral } from '../../content/general';
import { PhoneName } from '../../content/types';

const { width: W } = Dimensions.get('screen');
const SIDE_PADDING = (W * 5.6) / 100;

type Props = {
  navigation: any;
  phone: PhoneName;
  /** Which app's colours and name to use (the Settings header is this same bar). */
  app?: 'calculator' | 'settings';
  title?: string;
};

/** Plain app title bar: back arrow, app name, and a close button that returns to the home screen. */
export default function Header({ navigation, phone, app = 'calculator', title }: Props) {
  const colors = (theme as any)[phone][app].colors.header;
  const Back = I18nManager.isRTL ? ArrowRight : ArrowLeft;

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderColor: colors.items }]}>
      <View style={styles.leftContainer}>
        <CustomButton
          activeOpacity={0.6}
          onPress={() => navigation.goBack()}
          style={[styles.button, { alignItems: 'flex-start', paddingLeft: SIDE_PADDING }]}>
          <Back size={scale(32)} color={colors.items} />
        </CustomButton>
      </View>
      <View style={styles.middleContainer}>
        <CustomText center white bold variant={title ? 'text' : 'h4'} text={getGeneral('apps', app)} />
      </View>
      <View style={styles.rightContainer}>
        <CustomButton
          activeOpacity={0.6}
          onPress={() => navigation.popTo('homescreen')}
          style={[styles.button, { alignItems: 'flex-end', paddingRight: SIDE_PADDING }]}>
          <X size={scale(32)} color={colors.items} />
        </CustomButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { width: '100%', height: '9%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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
