import React, { useContext } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Phone as PhoneIcon } from 'lucide-react-native';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getContactImage } from '../../assets/images';
import { CallContext, CallElapsedTimeContext, CallStateContext } from './callContext';

/** Caller avatar with a voice-level pulse, the call timer and the live caption. */
export default function Listen() {
  const { ongoing, status } = useContext(CallContext);
  const { elapsedTime } = useContext(CallElapsedTimeContext);
  const { caption, visualizerAnim } = useContext(CallStateContext);

  const color = status === 'ended' ? theme.colors.red : '#FFFFFF55';
  const speaker = caption?.speaker && caption.speaker !== 'player' ? caption.speaker : ongoing?.contact;

  return (
    <View style={styles.listen}>
      <View style={styles.left}>
        <View style={styles.meta}>
          <PhoneIcon fill={color} strokeWidth={0} size={scale(12)} />
          <CustomText noDefaultMargin color={color} bold variant="small" text={elapsedTime} />
        </View>
        <View style={styles.characterWrapper}>
          <View style={styles.character}>
            <Animated.View
              style={{
                width: '100%',
                aspectRatio: 1,
                borderRadius: scale(200),
                backgroundColor: '#FFFFFF44',
                transform: [
                  { scale: visualizerAnim.interpolate({ inputRange: [1, 1.1, 1.2, 2], outputRange: [0.75, 0.9, 1, 1.2] }) },
                ],
              }}
            />
            <CustomImage style={styles.image} width="75%" aspectRatio={1} source={getContactImage(speaker)} />
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <CustomText bold variant="caption" color="#FFFFFFDD" noDefaultMargin text={caption?.text} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listen: {
    width: '100%',
    height: '100%',
    paddingHorizontal: '3.5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    width: '25%',
    height: '60%',
    backgroundColor: '#112522',
    borderRadius: scale(200),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  meta: { width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center', paddingLeft: '6%' },
  characterWrapper: { width: '50%', height: '100%', justifyContent: 'center', alignItems: 'flex-end' },
  character: { width: '100%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginRight: '4%' },
  image: { position: 'absolute', borderRadius: scale(100), overflow: 'hidden' },
  right: { width: '72%', height: '90%', justifyContent: 'center' },
});
