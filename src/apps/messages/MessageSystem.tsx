import React, { useContext } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import CustomText from '../../components/CustomText';
import { scale } from '../../theme/scale';
import { GlobalContext } from '../../state/GlobalProvider';
import { systemText } from './chatData';
import useBlink from './useBlink';

/** Centred system line: dates, "You are now chatting with…", deleted-history notes. */
export default function MessageSystem({ text, blinking }: { text: string; blinking: boolean }) {
  const { session } = useContext(GlobalContext);
  const opacity = useBlink(blinking);
  const token = text.split('::')[1] ?? '';
  return (
    <View style={styles.system}>
      <Animated.View style={{ opacity }}>
        <CustomText bold noDefaultMargin variant="caption" center white text={systemText(token, session)} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  system: {
    alignSelf: 'center',
    backgroundColor: '#011821AA',
    paddingHorizontal: '4%',
    paddingVertical: '2.5%',
    borderRadius: scale(8),
    marginBottom: '1%',
  },
});
