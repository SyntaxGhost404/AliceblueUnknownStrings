import React, { useContext, useState } from 'react';
import { I18nManager, Keyboard, StyleSheet, TextInput, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { GlobalContext } from '../../state/GlobalProvider';
import { getAppString } from '../../content/appStrings';
import { PIXABOWL_LOGIN, pixabowlStrings } from '../../content/mock/pixabowl';
import { PhoneName } from '../../content/types';
import Header from './Header';

const str = (key: string) => getAppString('herphone', 'pixabowl', key);

type Props = { phone: PhoneName; navigation: any; setNotiBarColor: (c: string) => void };

/** "Forgot password": the right answer to the security question gets the player in. */
export default function SecurityQuestion({ phone, navigation, setNotiBarColor }: Props) {
  const { triggerAction, updateAppState } = useContext(GlobalContext);
  const colors = (theme as any)[phone].pixabowl.colors;
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const onLogin = () => {
    if (answer.trim().toLowerCase() !== PIXABOWL_LOGIN.answer) {
      setError(pixabowlStrings.incorrect_answer);
      return;
    }
    Keyboard.dismiss();
    updateAppState(phone, 'pixabowl', { loggedIn: true });
    triggerAction(PIXABOWL_LOGIN.onLogin);
    navigation.replace('home');
  };

  return (
    <View style={[styles.parentLayout, { backgroundColor: colors.background }]} onTouchStart={() => Keyboard.dismiss()}>
      <Header phone={phone} setNotiBarColor={setNotiBarColor} />
      <View style={styles.form}>
        <CustomText variant="subtext" gray style={{ marginBottom: '20%' }} text={str('sec_question_prompt')} />
        <CustomText noDefaultMargin center variant="subtext" white text={str('sec_question')} />
        <TextInput
          style={[
            styles.input,
            { borderColor: colors.text, color: colors.text, textAlign: I18nManager.isRTL ? 'right' : 'left' },
          ]}
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType="visible-password"
          placeholder={str('answer')}
          placeholderTextColor={theme.colors.darkGray}
          editable
          value={answer}
          onChangeText={text => {
            setAnswer(text);
            setError('');
          }}
          maxLength={12}
        />
        <CustomText variant="subtext" center error noDefaultMargin text={error} />
        <CustomButton style={[styles.submitButton, { backgroundColor: colors.submitButton }]} onPress={onLogin}>
          <CustomText noDefaultMargin style={{ marginBottom: '2%' }} variant="subtext" text={str('login')} />
        </CustomButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' },
  form: { width: '65%', marginTop: '35%' },
  input: {
    borderBottomWidth: scale(1),
    fontSize: scale(14),
    width: '100%',
    marginBottom: '8%',
    marginTop: '2%',
    fontFamily: 'Quicksand-Regular',
  },
  submitButton: {
    marginTop: '4%',
    borderRadius: scale(100),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '3%',
    paddingHorizontal: '14%',
  },
});
