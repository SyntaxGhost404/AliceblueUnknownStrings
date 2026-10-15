import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { playAnimation } from '../../theme/animation';
import { CallType } from '../../phone/call/CallProvider';

// 1-9, star, 0, hash — the star is the full-width character used by the reference build.
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '＊', '0', '#'];

type Props = {
  onCall: boolean;
  type?: CallType;
  input: string;
  onPressKey: (key: string) => void;
  onPressCall: () => void;
  onPressBackspace: () => void;
  functionalityDisabled: boolean;
};

/** Dial pad: twelve keys plus call/hang-up and backspace. The backspace fades while a call is on. */
export default function Keypad({ onCall, type, input, onPressKey, onPressCall, onPressBackspace, functionalityDisabled }: Props) {
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    playAnimation(fade, onCall ? 1 : 0, 400);
  }, [onCall, fade]);

  const actions = [
    { icon: 'call', color: theme.colors.green, size: scale(30), func: onPressCall },
    { icon: 'backspace', color: theme.colors.white, size: scale(26), func: onPressBackspace },
  ];

  return (
    <View style={[styles.keypad, { opacity: functionalityDisabled ? 0.3 : 1 }]}>
      {KEYS.map(key => (
        <CustomButton key={key} silent onPress={() => onPressKey(key)} activeOpacity={0.6} style={styles.key}>
          <CustomText bold white variant="h3" text={key} />
        </CustomButton>
      ))}
      <View style={[styles.key, { opacity: 0 }]} />
      {actions.map(action => {
        const backspace = action.icon === 'backspace';
        const call = action.icon === 'call';
        return (
          <Animated.View
            key={action.icon}
            style={[
              styles.key,
              { opacity: backspace ? (input.length <= 0 ? 0 : fade.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })) : 1 },
            ]}>
            <CustomButton
              disabled={functionalityDisabled || (backspace && (input.length <= 0 || onCall)) || (call && type === 'incoming')}
              onPress={action.func}
              activeOpacity={0.6}
              style={styles.action}>
              <MaterialIcons
                name={call && onCall ? 'call-end' : action.icon}
                size={action.size}
                color={call ? (onCall ? theme.colors.red : theme.colors.green) : theme.colors.white}
              />
            </CustomButton>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '90%',
    height: '60%',
  },
  key: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '32%',
    height: '20%',
    marginVertical: '1%',
    backgroundColor: '#FFFFFF0C',
    borderRadius: scale(8),
  },
  action: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
});
