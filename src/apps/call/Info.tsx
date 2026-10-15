import React, { useContext, useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { playAnimation } from '../../theme/animation';
import { CallElapsedTimeContext, CallStateContext, CallStatus } from '../../phone/call/callContext';

type Props = {
  name: string;
  status: CallStatus;
  /** Show the live caption under the status (phone menus); conversations caption in their own view. */
  showCaptions: boolean;
};

/** Who is on the line: name, "calling..." / call timer / "ended", and optionally the caption. */
export default function Info({ name, status, showCaptions }: Props) {
  const { caption } = useContext(CallStateContext);
  const { elapsedTime } = useContext(CallElapsedTimeContext);
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    playAnimation(fade, 1, 800);
  }, [fade]);

  const statusText = status === 'talking' ? elapsedTime : status === 'calling' ? `${status}...` : status;

  return (
    <Animated.View style={[styles.parentLayout, { height: showCaptions ? '39%' : '20%', opacity: fade }]}>
      <View style={[styles.meta, { height: showCaptions ? '45%' : '100%' }]}>
        <CustomText white style={{ fontSize: scale(26) }} text={name} />
        <CustomText
          noDefaultMargin
          color={status === 'ended' ? theme.colors.red : '#FFFFFF60'}
          style={{ fontSize: scale(16) }}
          text={statusText}
        />
      </View>
      {showCaptions ? (
        <View style={styles.caption}>
          {caption ? <CustomText center variant="subtext" color="white" text={caption.text} /> : null}
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { width: '90%', justifyContent: 'space-between', alignItems: 'center' },
  meta: { width: '100%', justifyContent: 'center', alignItems: 'center' },
  caption: {
    height: '55%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '6%',
    paddingVertical: '2%',
    borderRadius: scale(10),
    backgroundColor: '#FFFFFF00',
  },
});
