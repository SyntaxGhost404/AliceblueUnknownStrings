import React, { useContext, useEffect, useState } from 'react';
import { Animated, I18nManager, StyleSheet, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Lock } from 'lucide-react-native';
import CustomButton from '../components/CustomButton';
import CustomText from '../components/CustomText';
import theme from '../theme/theme';
import { isTablet, scale } from '../theme/scale';
import { playAnimation } from '../theme/animation';
import { GlobalContext } from '../state/GlobalProvider';
import { passcodes } from '../content';
import { PhoneName } from '../content/types';

const TAB_INDEX: Record<PhoneName, number> = { myphone: 1, herphone: 2 };

/** Passcode pad over a locked phone's lock screen. Wrong codes flash red and reset. */
export default function PassLock({ phone, setShowPasslock }: { phone: PhoneName; setShowPasslock: (v: boolean) => void }) {
  const { dispatch } = useNavigation<any>();
  const { session, setLocked, setNotifications, triggerAction } = useContext(GlobalContext);
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [pass, setPass] = useState('');
  const [wrong, setWrong] = useState(false);
  const code = passcodes[phone] ?? '';
  const colors = (theme as any)[phone].lockscreen.colors;

  useEffect(() => {
    playAnimation(fadeAnim, 1, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (pass.length !== code.length || !code) return;
    if (pass === code) {
      playAnimation(fadeAnim, 0.01, 400);
      const unlock = setTimeout(() => {
        setNotifications(prev => ({ ...prev, [phone]: [] }));
        dispatch((state: any) => {
          const routes = [...state.routes];
          const index = TAB_INDEX[phone];
          routes[index] = { ...routes[index], state: { index: 0, routes: [{ name: 'homescreen' }] } };
          return CommonActions.reset({ ...state, routes });
        });
        setLocked(prev => ({ ...(prev ?? { myphone: false, herphone: true }), [phone]: false }));
        setShowPasslock(false);
        triggerAction({ app: 'objective', delay: 1200 });
      }, 50);
      return () => clearTimeout(unlock);
    }
    setWrong(true);
    const reset = setTimeout(() => {
      setPass('');
      setWrong(false);
    }, 300);
    return () => clearTimeout(reset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pass]);

  const handleKey = (key: string) => {
    if (key === 'X') setPass('');
    else setPass(p => (p.length < code.length ? p + key : p));
  };

  const keys = (I18nManager.isRTL ? '3216549870' : '1234567890').split('');

  return (
    <Animated.View
      style={[
        styles.parentLayout,
        { opacity: fadeAnim, transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [1.1, 1] }) }] },
      ]}>
      <View style={{ flexDirection: 'row' }}>
        <Lock size={scale(20)} color={colors.passlock} />
      </View>
      <View style={styles.pass}>
        {code.split('').map((_, index) => (
          <View key={index} style={styles.digit}>
            {pass[index] !== undefined ? (
              <View
                style={{
                  width: '30%',
                  aspectRatio: 1,
                  borderRadius: scale(100),
                  backgroundColor: wrong ? theme.colors.red : theme.colors.white,
                }}
              />
            ) : null}
          </View>
        ))}
      </View>
      <View style={styles.keypad}>
        {keys.map(key => (
          <CustomButton key={key} activeOpacity={0.7} style={styles.key} onPress={() => handleKey(key)}>
            <CustomText variant="h2" color={colors.passlock} text={key} />
          </CustomButton>
        ))}
      </View>
    </Animated.View>
  );
}

const passColor = (theme as any).herphone.lockscreen.colors.passlock;

const styles = StyleSheet.create({
  parentLayout: { position: 'absolute', top: '18%', width: '100%', justifyContent: 'center', alignItems: 'center' },
  pass: { width: '70%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: '5%' },
  digit: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '10%',
    aspectRatio: 1,
    marginHorizontal: '1%',
    borderRadius: scale(100),
    borderColor: passColor,
    borderWidth: scale(1),
  },
  keypad: {
    width: isTablet ? '70%' : '80%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '6%',
  },
  key: {
    width: isTablet ? '26%' : '29%',
    aspectRatio: 1,
    borderRadius: scale(100),
    justifyContent: 'center',
    alignItems: 'center',
    margin: '2%',
    paddingVertical: '2%',
    borderColor: passColor,
    borderWidth: scale(1),
  },
});
