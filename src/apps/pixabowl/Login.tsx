import React, { useContext, useEffect, useState } from 'react';
import { Animated, I18nManager, Keyboard, StyleSheet, TextInput, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { playAnimation } from '../../theme/animation';
import { getAppLogo } from '../../assets/images';
import { GlobalContext } from '../../state/GlobalProvider';
import { getAppString } from '../../content/appStrings';
import { PIXABOWL_LOGIN } from '../../content/mock/pixabowl';
import { PhoneName } from '../../content/types';
import Header from './Header';

const str = (key: string) => getAppString('herphone', 'pixabowl', key);
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

type Props = { phone: PhoneName; navigation: any; setNotiBarColor: (c: string) => void };

/** Login: the logo slides away after a moment and the form fades in; "forgot password" asks the security question. */
export default function Login({ phone, navigation, setNotiBarColor }: Props) {
  const { triggerAction, updateAppState } = useContext(GlobalContext);
  const colors = (theme as any)[phone].pixabowl.colors;
  const [anim] = useState(() => new Animated.Value(1));
  const [username, setUsername] = useState(PIXABOWL_LOGIN.username);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => playAnimation(anim, 0, 1000), 1200);
    return () => clearTimeout(timer);
  }, [anim]);

  const onSubmit = () => {
    if (password !== PIXABOWL_LOGIN.password) {
      setError(str('incorrect_pass'));
      return;
    }
    Keyboard.dismiss();
    updateAppState(phone, 'pixabowl', { loggedIn: true });
    triggerAction(PIXABOWL_LOGIN.onLogin);
    navigation.replace('home');
  };

  const input = [
    styles.input,
    { borderColor: colors.text, color: colors.text, textAlign: I18nManager.isRTL ? 'right' : 'left' } as const,
  ];

  return (
    <View style={[styles.parentLayout, { backgroundColor: colors.background }]} onTouchStart={() => Keyboard.dismiss()}>
      <Header phone={phone} setNotiBarColor={setNotiBarColor} />
      <Animated.View
        style={[
          styles.logo,
          { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-100, 0] }) }] },
        ]}>
        <CustomImage width="100%" aspectRatio={1} source={getAppLogo('pixabowl', 'small')} />
      </Animated.View>
      <Animated.View
        style={[styles.form, { opacity: anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [1, 0, 0] }) }]}>
        <CustomText noDefaultMargin variant="subtext" gray style={{ textTransform: 'uppercase' }} text={str('username')} />
        <TextInput
          style={input}
          keyboardType="visible-password"
          placeholder={capitalize(str('username'))}
          placeholderTextColor={theme.colors.darkGray}
          editable={false}
          value={username}
          onChangeText={setUsername}
          maxLength={12}
        />
        <CustomText
          style={{ marginTop: '10%', textTransform: 'uppercase' }}
          noDefaultMargin
          variant="subtext"
          gray
          text={str('password')}
        />
        <TextInput
          style={input}
          placeholder={capitalize(str('password'))}
          placeholderTextColor={theme.colors.darkGray}
          editable
          value={password}
          onChangeText={text => {
            setPassword(text);
            setError('');
          }}
          maxLength={12}
          secureTextEntry
        />
        <CustomText variant="subtext" center error text={error} />
        <CustomButton style={[styles.submitButton, { backgroundColor: colors.submitButton }]} onPress={onSubmit}>
          <CustomText noDefaultMargin style={{ marginBottom: '2%' }} text={str('submit')} />
        </CustomButton>
        <CustomButton
          style={{ marginVertical: '6%', alignSelf: 'center' }}
          onPress={() => {
            Keyboard.dismiss();
            navigation.replace('security-question');
          }}>
          <CustomText variant="subtext" white bold noDefaultMargin text={str('forgot_pass')} />
        </CustomButton>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' },
  logo: { position: 'absolute', width: '20%', top: '35%' },
  form: { width: '55%', marginTop: '30%' },
  input: {
    borderBottomWidth: scale(1),
    fontSize: scale(14),
    width: '100%',
    marginBottom: '5%',
    fontFamily: 'Quicksand-Regular',
  },
  submitButton: {
    marginTop: '10%',
    borderRadius: scale(100),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '4%',
    paddingHorizontal: '34%',
  },
});
