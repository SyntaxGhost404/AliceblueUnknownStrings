import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AlertOctagon } from 'lucide-react-native';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { playSound } from '../../audio/sound';
import { GlobalContext } from '../../state/GlobalProvider';
import { getAppString } from '../../content/appStrings';
import { callingDisabled } from '../../content/mock/callHistory';
import { PhoneName } from '../../content/types';
import { CallContext, CallStateContext } from '../../phone/call/callContext';
import Conversation from './Conversation';
import Info from './Info';
import Keypad from './Keypad';

const MAX_DIGITS = 7;

/**
 * Dial screen: the typed number (or who is on the line), and below it the dial pad or, for scripted
 * conversations, the conversation view. Where calling is unavailable it shows a notice instead.
 */
export default function Dial({ phone, navigation }: { phone: PhoneName; navigation: any }) {
  const { soundsEnabled } = useContext(GlobalContext);
  const { ongoing, mode, instance, status, startCall, endCall } = useContext(CallContext);
  const { pressDigit } = useContext(CallStateContext);
  const [input, setInput] = useState('');
  const functionalityDisabled = callingDisabled[phone] && !ongoing;
  const method = instance?.method;
  const showCaptions = method !== 'conversation' && method !== 'automated';

  // A minimised call takes the player back to the home screen.
  useEffect(() => {
    if (mode === 'floating') navigation.popTo('homescreen');
  }, [mode, navigation]);

  const onPressKey = (key: string) => {
    if (functionalityDisabled) return;
    if (soundsEnabled) playSound('dialpad.mp3', 0.7);
    if (status !== 'idle') pressDigit(key);
    else if (input.length < MAX_DIGITS) setInput(prev => prev + key);
  };

  const onPressCall = () => {
    if (ongoing) endCall();
    else if (input !== '') startCall(input, 'outgoing');
  };

  const onPressBackspace = () => setInput(prev => prev.slice(0, -1));

  return (
    <View style={[styles.parentLayout, { backgroundColor: (theme as any)[phone].call.colors.background }]}>
      {functionalityDisabled ? (
        <View style={styles.unavailable}>
          <AlertOctagon size={scale(18)} color={theme.colors.yellow} />
          <CustomText
            noDefaultMargin
            color={theme.colors.yellow}
            center
            variant="subtext"
            text={getAppString('myphone', 'phone', 'calling_unavailable')}
            style={{ paddingTop: 0, paddingBottom: '1%', marginLeft: '2%' }}
          />
        </View>
      ) : ongoing ? (
        <Info name={ongoing.name || ongoing.number} status={status} showCaptions={showCaptions} />
      ) : (
        <View style={styles.input}>
          <CustomText white style={{ fontSize: scale(40) }} text={input} />
        </View>
      )}
      {ongoing && instance && !showCaptions ? (
        <Conversation phone={phone} />
      ) : (
        <Keypad
          onCall={!!ongoing}
          type={ongoing?.type}
          input={input}
          onPressKey={onPressKey}
          onPressCall={onPressCall}
          onPressBackspace={onPressBackspace}
          functionalityDisabled={functionalityDisabled}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '91%',
    paddingBottom: '14%',
  },
  input: { height: '40%', width: '90%', justifyContent: 'center', alignItems: 'center' },
  unavailable: { alignItems: 'center', justifyContent: 'center', width: '85%', height: '20%' },
});
