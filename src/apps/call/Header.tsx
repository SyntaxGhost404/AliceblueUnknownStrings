import React, { useContext } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { History, Phone, X } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getGeneral } from '../../content/general';
import { PhoneName } from '../../content/types';
import { CallContext } from '../../phone/call/CallProvider';

const { width: W } = Dimensions.get('screen');
const SIDE_PADDING = (W * 5.6) / 100;

type Props = {
  navigation: any;
  phone: PhoneName;
  title?: string;
  showDial: boolean;
  setShowDial: React.Dispatch<React.SetStateAction<boolean>>;
  /** A call is in progress (the dial/history switch is hidden). */
  onCall: boolean;
};

/**
 * Title bar of the Phone app: dial pad / history switch on the left, the app name, and a close
 * button on the right. During a call the close button minimises the call into the floating bubble.
 */
export default function Header({ navigation, phone, title, showDial, setShowDial, onCall }: Props) {
  const { mode, status, setMode } = useContext(CallContext);
  const colors = (theme as any)[phone].call.colors.header;
  const minimise = onCall && mode === 'app' && status !== 'ended';

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderColor: colors.items }]}>
      <View style={styles.leftContainer}>
        {!onCall ? (
          <CustomButton
            activeOpacity={0.6}
            onPress={() => setShowDial(show => !show)}
            style={[styles.button, { alignItems: 'flex-start', paddingLeft: SIDE_PADDING }]}>
            {showDial ? (
              <History size={scale(24)} color={colors.items} style={{ marginLeft: '10%' }} />
            ) : (
              <Phone size={scale(24)} color={colors.items} style={{ marginLeft: '10%' }} />
            )}
          </CustomButton>
        ) : null}
      </View>
      <View style={styles.middleContainer}>
        <CustomText center white bold variant={title ? 'text' : 'h4'} text={title ?? getGeneral('apps', 'phone')} />
      </View>
      <View style={styles.rightContainer}>
        <CustomButton
          activeOpacity={0.6}
          onPress={() => (minimise ? setMode('floating') : navigation.popTo('homescreen'))}
          style={[styles.button, { alignItems: 'flex-end', paddingRight: SIDE_PADDING }]}>
          <X size={scale(32)} color={colors.items} />
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
