import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { AudioLines } from 'lucide-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomButton from '../../components/CustomButton';
import { scale } from '../../theme/scale';
import { createAnimation } from '../../theme/animation';
import { createSound, GameSound } from '../../audio/sound';
import { MUSIC_VOLUME, useMusic } from '../../audio/MusicProvider';
import { GlobalContext } from '../../state/GlobalProvider';
import { FileItem, fileSounds } from '../../content/mock/files';

const { width: W, height: H } = Dimensions.get('screen');
const CARD_W = W * 0.8;
const INNER_W = CARD_W * 0.9;
const PLAY_SIZE = INNER_W * 0.12;
const BAR_W = INNER_W * 0.8;

type Props = { data: FileItem };

/** Voice-note player: a play/pause disc and a progress bar that fills as it plays. */
export default function FileAudio({ data }: Props) {
  const music = useMusic();
  const { appState, playSubtitles, stopSubtitles } = useContext(GlobalContext);
  const [sound, setSound] = useState<GameSound | null>(null);
  const [progress] = useState(() => new Animated.Value(0));
  const [playing, setPlaying] = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  const anim = useRef<Animated.CompositeAnimation | null>(null);
  /** Seconds already played, and when the current stretch started (for pause/resume). */
  const played = useRef(0);
  const startedAt = useRef(0);
  const duration = useRef(0);

  useEffect(() => {
    const loaded = createSound(fileSounds[data.id] ?? data.id, s => {
      if (s === 'error') return;
      duration.current = s.getDuration();
    });
    setSound(loaded);
    return () => {
      anim.current?.stop();
      loaded.stop();
      loaded.release();
      stopSubtitles();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    anim.current?.stop();
    progress.setValue(0);
    played.current = 0;
    setPlaying(false);
    stopSubtitles();
  };

  // Leaving the app stops the recording.
  useEffect(() => {
    if (appState === 'background' && sound) {
      sound.stop();
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]);

  // Play or pause, ducking the score while the recording is heard.
  useEffect(() => {
    if (!sound) return;
    if (!playing) {
      music?.setVolume(MUSIC_VOLUME);
      sound.pause();
      anim.current?.stop();
      if (startedAt.current) played.current += (Date.now() - startedAt.current) / 1000;
      startedAt.current = 0;
      stopSubtitles();
      return;
    }
    music?.setVolume(0);
    const total = duration.current || sound.getDuration();
    startedAt.current = Date.now();
    if (data.subtitles) playSubtitles(captionsFrom(data.subtitles, played.current * 1000));
    sound.play(success => {
      if (success) {
        startedAt.current = 0;
        reset();
        music?.setVolume(MUSIC_VOLUME);
      }
    });
    const remaining = total - played.current;
    if (remaining > 0) {
      anim.current = createAnimation(progress, 100, remaining * 1000, Easing.linear);
      anim.current.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, sound]);

  return (
    <View style={styles.audio}>
      <View style={styles.display}>
        <AudioLines size={scale(64)} color="#FFFFFF33" />
      </View>
      <View style={styles.control}>
        <CustomButton activeOpacity={0.6} style={styles.playpause} onPress={() => setPlaying(value => !value)}>
          <Ionicons
            style={{ marginLeft: scale(1) }}
            name={playing ? 'pause' : 'play'}
            size={scale(20)}
            color="#111"
          />
        </CustomButton>
        <View style={styles.outerBar} onLayout={(e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width)}>
          <Animated.View
            style={[
              styles.innerBar,
              {
                transform: [
                  { translateX: progress.interpolate({ inputRange: [0, 100], outputRange: [-barWidth / 2, 0] }) },
                  { scaleX: progress.interpolate({ inputRange: [0, 100], outputRange: [0, 1] }) },
                ],
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

/** Captions still to come when playback (re)starts `fromMs` into the recording. */
function captionsFrom(lines: { text: string; duration: number }[], fromMs: number) {
  const rest: { text: string; duration: number }[] = [];
  let at = 0;
  lines.forEach(line => {
    const end = at + line.duration;
    if (end > fromMs) rest.push({ text: line.text, duration: Math.min(line.duration, end - fromMs) });
    at = end;
  });
  return rest;
}

const styles = StyleSheet.create({
  audio: {
    width: CARD_W,
    backgroundColor: '#111',
    borderRadius: scale(10),
    overflow: 'hidden',
    alignSelf: 'center',
    padding: '4%',
  },
  display: { width: '100%', height: H * 0.3, justifyContent: 'center', alignItems: 'center' },
  control: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' },
  playpause: {
    width: PLAY_SIZE,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(100),
    backgroundColor: '#FFFFFF44',
    marginRight: '4%',
  },
  outerBar: {
    width: BAR_W,
    height: PLAY_SIZE / 6,
    borderRadius: scale(100),
    backgroundColor: '#FFFFFF17',
    overflow: 'hidden',
  },
  innerBar: { width: '100%', height: '100%', backgroundColor: '#FFFFFF44', borderRadius: scale(100) },
});
