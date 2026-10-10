import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getContactImage } from '../../assets/images';
import { createSound, GameSound } from '../../audio/sound';
import { GlobalContext } from '../../state/GlobalProvider';
import contacts from '../../content/mock/contacts';
import { formatMessageTime } from './chatData';
import useBlink from './useBlink';

const chatColors = (theme as any).myphone.messages.colors.chat;

type Props = { text: string; blinking: boolean; sender?: string; type: number; time: string; group?: boolean };

/** Voice note: play/pause disc, progress bar that fills while it plays, and the time. */
export default function MessageAudio({ text, blinking, sender, type, time, group }: Props) {
  const { soundsEnabled } = useContext(GlobalContext);
  const opacity = useBlink(blinking);
  const [playing, setPlaying] = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  const [progress] = useState(() => new Animated.Value(0));
  const sound = useRef<GameSound | null>(null);
  const anim = useRef<Animated.CompositeAnimation | null>(null);
  const file = text.split('::')[1];

  const stopAudio = () => {
    anim.current?.stop();
    progress.setValue(0);
    sound.current?.stop();
    sound.current?.release();
    sound.current = null;
    setPlaying(false);
  };

  useEffect(() => () => stopAudio(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const playAudioAnim = (duration: number) => {
    progress.setValue(0);
    anim.current = Animated.timing(progress, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true });
    anim.current.start(({ finished }) => {
      if (finished) stopAudio();
    });
  };

  const onAudioPlayPause = () => {
    if (playing) {
      stopAudio();
      return;
    }
    setPlaying(true);
    if (!soundsEnabled) {
      playAudioAnim(4000);
      return;
    }
    sound.current = createSound(file, s => {
      if (s === 'error') {
        // No recording for placeholder voice notes: still animate a short clip.
        playAudioAnim(4000);
        return;
      }
      s.setVolume(1);
      s.play();
      playAudioAnim(Math.max(1000, s.getDuration() * 1000));
    });
  };

  return (
    <View style={[styles.message, { paddingVertical: '1%', backgroundColor: chatColors['message' + (type + 1)] }]}>
      <Animated.View style={{ opacity }}>
        {group && type === 0 && sender ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: '1%' }}>
            <CustomImage
              style={{ marginRight: scale(8), borderRadius: scale(100) }}
              width={scale(18)}
              aspectRatio={1}
              source={getContactImage(sender)}
            />
            <CustomText
              variant="subtext"
              bold
              noDefaultMargin
              style={{ color: chatColors.sender, alignSelf: 'flex-start' }}
              text={contacts[sender]?.name ?? sender}
            />
          </View>
        ) : null}
        <View style={styles.audio}>
          <CustomButton activeOpacity={0.6} style={styles.playpause} onPress={onAudioPlayPause}>
            <Ionicons name={playing ? 'pause' : 'play'} size={scale(20)} color="#27404a" />
          </CustomButton>
          <View style={styles.outerBar} onLayout={(e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width)}>
            <Animated.View
              style={[
                styles.innerBar,
                {
                  transform: [
                    { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-barWidth / 2, 0] }) },
                    { scaleX: progress },
                  ],
                },
              ]}
            />
          </View>
        </View>
        <View style={styles.time}>
          <CustomText
            style={{ textAlign: type === 0 ? 'left' : 'right' }}
            noDefaultMargin
            color={chatColors.date}
            variant="small"
            text={formatMessageTime(time)}
            numberOfLines={1}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  message: { justifyContent: 'center', maxWidth: '65%', width: '65%', borderRadius: scale(14), overflow: 'hidden', paddingHorizontal: '4%' },
  audio: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '2%',
    paddingVertical: '8%',
  },
  playpause: {
    width: '22%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(100),
    backgroundColor: '#FFFFFF77',
  },
  outerBar: { width: '73%', aspectRatio: 10, borderRadius: scale(100), backgroundColor: '#FFFFFF22', overflow: 'hidden' },
  innerBar: { width: '100%', height: '100%', borderRadius: scale(100), backgroundColor: '#FFFFFF77' },
  time: { width: '100%', paddingTop: scale(4) },
});
