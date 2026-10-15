import React from 'react';
import { Dimensions, I18nManager, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getGeneral } from '../../content/general';
import { newNoteId } from '../../content/mock/notes';
import { PhoneName } from '../../content/types';

const { width: W } = Dimensions.get('screen');
const SIDE_PADDING = (W * 5.6) / 100;

type Props = { phone: PhoneName; title?: string; showAdd?: boolean; showBack?: boolean };

/** Notes title bar: back arrow (note screen) or add button (list), title, close. */
export default function Header({ phone, title, showAdd, showBack }: Props) {
  const navigation = useNavigation<any>();
  const colors = (theme as any)[phone].notes.colors;
  const Back = I18nManager.isRTL ? ArrowRight : ArrowLeft;
  const leftButton = [styles.button, { alignItems: 'flex-start' as const, paddingLeft: SIDE_PADDING }];

  return (
    <View style={[styles.header, { backgroundColor: colors.header.background, borderColor: colors.header.items }]}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <CustomButton activeOpacity={0.6} onPress={() => navigation.goBack()} style={leftButton}>
            <Back size={scale(32)} color={colors.header.items} />
          </CustomButton>
        ) : null}
        {showAdd ? (
          <CustomButton
            activeOpacity={0.6}
            onPress={() => navigation.navigate('note', { data: { id: newNoteId(), text: '' }, isNew: true })}
            style={leftButton}>
            <Plus size={scale(30)} color={colors.accent} strokeWidth={2} />
          </CustomButton>
        ) : null}
      </View>
      <View style={styles.middleContainer}>
        <CustomText center bold variant="h4" color={colors.header.items} text={title ?? getGeneral('apps', 'notes')} />
      </View>
      <View style={styles.rightContainer}>
        <CustomButton
          activeOpacity={0.6}
          onPress={() => navigation.popTo('homescreen')}
          style={[styles.button, { alignItems: 'flex-end', paddingRight: SIDE_PADDING }]}>
          <X strokeWidth={1.7} size={scale(32)} color={colors.header.items} />
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
