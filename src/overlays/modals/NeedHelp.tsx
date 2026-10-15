import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomModal from '../../components/CustomModal';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getGeneral } from '../../content/general';
import { faqExtra, supportEmail } from '../../content/mock/modals';
import FAQList from './FAQList';
import { FAQ } from './FAQItem';

/** Questions come from `getGeneral('faq', 'question_N')` (numbered until a key is missing), then the extras. */
function getFaq(): FAQ[] {
  const list: FAQ[] = [];
  for (let n = 1; getGeneral('faq', `question_${n}`) !== `question_${n}`; n++) {
    list.push({ question: getGeneral('faq', `question_${n}`), answer: getGeneral('faq', `question_${n}_ans`) });
  }
  return [...list, ...faqExtra];
}

/** "Need help?" dialog: expandable FAQ and a mailto link to support. */
export default function NeedHelp({ onClose }: { onClose: () => void }) {
  return (
    <CustomModal visible setVisible={onClose}>
      <View style={styles.container}>
        <CustomText white center variant="text" text={getGeneral('help', 'faq')} />
        <FAQList data={getFaq()} />
        <CustomText color={theme.colors.darkerGray} center variant="subtext" text={getGeneral('help', 'still_stuck')} />
        <CustomButton style={styles.button} onPress={() => Linking.openURL('mailto:' + supportEmail)}>
          <CustomText
            center
            color={theme.colors.mediumGray}
            variant="text"
            noDefaultMargin
            text={getGeneral('help', 'contact_support')}
          />
        </CustomButton>
      </View>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '94%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%',
    paddingVertical: '4%',
    backgroundColor: '#070A0C',
    borderRadius: scale(16),
  },
  button: {
    paddingVertical: '3%',
    paddingHorizontal: '6%',
    borderWidth: scale(1),
    backgroundColor: '#FFFFFF09',
    borderRadius: scale(40),
  },
});
