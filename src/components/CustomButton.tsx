import React, { useContext } from 'react';
import { GestureResponderEvent, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { GlobalContext } from '../state/GlobalProvider';
import { playSound } from '../audio/sound';

export type CustomButtonProps = TouchableOpacityProps & {
  /** Suppress the click sound. */
  silent?: boolean;
  /** Override the default `button.mp3` click. */
  sound?: string;
};

/** Touchable with the game's standard click feedback (sound + 0.6 opacity). */
export default function CustomButton(props: CustomButtonProps) {
  const { soundsEnabled } = useContext(GlobalContext);

  const onPress = (e: GestureResponderEvent) => {
    if (soundsEnabled && !props.silent) {
      playSound(props.sound || 'button.mp3');
    }
    props.onPress?.(e);
  };

  return (
    <TouchableOpacity {...props} onPress={onPress} activeOpacity={props.activeOpacity || 0.6}>
      {props.children}
    </TouchableOpacity>
  );
}
