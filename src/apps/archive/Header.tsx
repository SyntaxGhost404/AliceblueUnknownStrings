import React from 'react';
import { Dimensions, I18nManager, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ArrowRight, X } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getGeneral } from '../../content/general';

const { width: W } = Dimensions.get('screen');
const SIDE_PADDING = (W * 5.6) / 100;
const colors = theme.myphone.archive.colors;

type Props = { title?: string; showBack?: boolean };

/** Archive title bar: back arrow, the app name (or the screen's title) and a close button. */
export default function Header({ title }: Props) {
  const navigation = useNavigation<any>();
  const Back = I18nManager.isRTL ? ArrowRight : ArrowLeft;

  return (
    <View style={[styles.header, { backgroundColor: colors.header.background, borderColor: colors.header.border }]}>
      <View style={styles.leftContainer}>
        <CustomButton
          activeOpacity={0.6}
          onPress={() => navigation.goBack()}
          style={[styles.button, { alignItems: 'flex-start', paddingLeft: SIDE_PADDING }]}>
          <Back size={scale(32)} color={colors.header.items} />
        </CustomButton>
      </View>
      <View style={styles.middleContainer}>
        <CustomText
          noDefaultMargin
          center
          bold
          variant={title ? 'h5' : 'h4'}
          text={title ?? getGeneral('apps', 'archive')}
          color={colors.header.items}
        />
      </View>
      <View style={styles.rightContainer}>
        <CustomButton
          activeOpacity={0.6}
          onPress={() => navigation.popTo('homescreen')}
          style={[styles.button, { alignItems: 'flex-end', paddingRight: SIDE_PADDING }]}>
          <X size={scale(32)} color={colors.header.items} />
        </CustomButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { width: '100%', height: '9%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leftContainer: { width: '8%', height: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
  middleContainer: { width: '75%', height: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  rightContainer: { width: '8%', height: '100%', flexDirection: 'row', justifyContent: 'flex-end' },
  button: { height: '100%', aspectRatio: 1.1, justifyContent: 'center' },
});
