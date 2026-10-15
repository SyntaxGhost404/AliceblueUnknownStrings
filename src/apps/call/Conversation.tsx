import React, { useContext } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { ScreenShare } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { moderateScale, scale } from '../../theme/scale';
import { getContactImage } from '../../assets/images';
import { PhoneName } from '../../content/types';
import { CallContext, CallStateContext } from '../../phone/call/callContext';
import { useCallOptions } from '../../phone/call/useCallOptions';

const { width: W } = Dimensions.get('screen');
const SHOW_TIME = 400;

const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 4,
};

/**
 * In-call view of a scripted conversation: the caption bubble above the caller's avatar, the timed
 * replies (dimmed until picked, with a shrinking bar) and, when offered, "Share Your Screen".
 */
export default function Conversation({ phone }: { phone: PhoneName }) {
  const { ongoing, instance } = useContext(CallContext);
  const { caption, options, selectReply, shareScreen, shareYourScreen } = useContext(CallStateContext);
  const { anims, bar, countdown, disabled, select } = useCallOptions(options, SHOW_TIME, selectReply);

  const speaker = caption?.speaker && caption.speaker !== 'player' ? caption.speaker : ongoing?.contact;

  return (
    <View style={styles.parentLayout}>
      <View style={styles.top}>
        <View style={styles.bubble}>
          <View style={styles.caption}>
            {caption ? (
              <CustomText
                bold
                center
                white
                noDefaultMargin
                style={{ fontSize: moderateScale(13) }}
                text={caption.text}
              />
            ) : null}
          </View>
        </View>
        <View style={[styles.character, { backgroundColor: (theme as any)[phone].call.colors.background }]}>
          <View style={styles.avatar}>
            <View style={{ width: '100%', aspectRatio: 1, borderRadius: scale(200) }} />
            <CustomImage style={styles.image} width="75%" aspectRatio={1} source={getContactImage(speaker)} />
          </View>
        </View>
      </View>
      {instance?.method === 'conversation' && !shareScreen ? (
        <View style={[styles.options, { justifyContent: options && options.length > 1 ? 'space-between' : 'center' }]}>
          {options?.map((option, index) => (
            <React.Fragment key={index}>
              <Animated.View style={[styles.option, { height: options.length > 1 ? '45%' : '65%', opacity: anims[index] }]}>
                <CustomButton disabled={disabled} activeOpacity={0.9} onPress={() => select(index)}>
                  <CustomText center variant="subtext" color="#FFFFFF" text={option.text} />
                </CustomButton>
              </Animated.View>
              {options.length > 1 && index === 0 ? (
                <Animated.View
                  style={{
                    width: W * 0.6,
                    height: scale(1.5),
                    backgroundColor: '#FFFFFF22',
                    borderRadius: scale(40),
                    opacity: bar,
                    transform: [{ scaleX: countdown }],
                  }}
                />
              ) : null}
            </React.Fragment>
          ))}
        </View>
      ) : null}
      {shareScreen ? (
        <View style={styles.actions}>
          <CustomButton style={styles.shareScreen} silent onPress={shareYourScreen}>
            <ScreenShare size={scale(30)} color="white" strokeWidth={scale(1)} />
            <CustomText noDefaultMargin variant="subtext" white style={{ marginTop: '4%' }} text="Share Your Screen" />
          </CustomButton>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { height: '80%', width: '90%', justifyContent: 'space-between', alignItems: 'center' },
  top: { width: '100%', height: '55%', justifyContent: 'space-between', alignItems: 'center' },
  bubble: { height: '60%', width: '100%', backgroundColor: '#112522', borderRadius: scale(12), ...shadow },
  caption: {
    height: '60%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '6%',
    paddingVertical: '2%',
  },
  character: {
    position: 'absolute',
    bottom: 0,
    height: '65%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(200),
    overflow: 'hidden',
  },
  avatar: {
    width: '92%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#112522',
    borderRadius: scale(200),
    overflow: 'hidden',
    ...shadow,
  },
  image: { position: 'absolute', borderRadius: scale(100), overflow: 'hidden', zIndex: 1 },
  options: { width: '100%', height: '45%', paddingHorizontal: '4%', alignItems: 'center' },
  option: { width: '100%', justifyContent: 'center', alignItems: 'center' },
  actions: { width: '100%', height: '50%', alignItems: 'center' },
  shareScreen: {
    paddingHorizontal: '12%',
    paddingVertical: '5%',
    backgroundColor: '#112522',
    borderRadius: scale(40),
    marginTop: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
