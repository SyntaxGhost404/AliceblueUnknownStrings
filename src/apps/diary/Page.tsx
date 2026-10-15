import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, ScrollViewInstance, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import theme from '../../theme/theme';
import { playAnimation } from '../../theme/animation';
import { getAppImage } from '../../assets/images';
import { createSound, GameSound, playSound } from '../../audio/sound';
import { MUSIC_VOLUME, useMusic } from '../../audio/MusicProvider';
import { GlobalContext } from '../../state/GlobalProvider';
import { getAppString } from '../../content/appStrings';
import { DiaryPageData } from '../../content/mock/diary';
import Content from './Content';
import ContentAnimation from './ContentAnimation';
import Riddle from './Riddle';

const { width: W, height: H } = Dimensions.get('screen');

/** A diary page as the list prepares it: narration times in seconds and the unlock state. */
export type DiaryEntry = Omit<DiaryPageData, 'content'> & {
  /** 0 = not recovered yet, 1 = riddle still locked, 2 = unlocked. */
  state: 0 | 1 | 2;
  content: { content: string; startTime: number }[];
};

type Props = {
  number: number;
  data: DiaryEntry;
  close: () => void;
  setDisableNotiBar: (v: boolean) => void;
  setSolvedPage: (index: number) => void;
  /** Called once the unlocked entry has been read out to the end. */
  onComplete: () => void;
  /** Whether finishing this entry should move the story on. */
  advancesStory: boolean;
};

/**
 * An open diary page: a handwritten entry whose lines are typed out in step with the
 * recording, or - while the page is still locked - the riddle that unlocks it.
 */
export default function Page({ number, data, close, setDisableNotiBar, setSolvedPage, onComplete, advancesStory }: Props) {
  const insets = useSafeAreaInsets();
  const music = useMusic();
  const { appState, triggerAction, setSwipeEnabled, soundsEnabled } = useContext(GlobalContext);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [state, setState] = useState<0 | 1 | 2>(data.state);
  const [header] = useState(() => new Animated.Value(0));
  const [text] = useState(() => new Animated.Value(0));
  const [puzzle] = useState(() => new Animated.Value(0));
  const [image] = useState(() => new Animated.Value(0));
  const [solving, setSolving] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sound = useRef<GameSound | null>(null);
  const clock = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbacks = useRef({ onComplete, advancesStory });
  callbacks.current = { onComplete, advancesStory };

  const later = (fn: () => void, delay: number) => {
    const t = setTimeout(fn, delay);
    timers.current.push(t);
    return t;
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Fade in what belongs to the current state.
  useEffect(() => {
    later(() => playAnimation(header, 1, 100), 250);
    if (state === 1) {
      later(() => playAnimation(puzzle, 1, 100), 250);
    } else if (state === 2) {
      later(() => playAnimation(text, 1, 100), 250);
      later(() => playAnimation(image, 1, 100), 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Solving the riddle: hide it, lock the shell down and read the entry out.
  useEffect(() => {
    if (!solving) {
      setSwipeEnabled(true);
      setDisableNotiBar(false);
      return;
    }
    playAnimation(puzzle, 0, 600);
    setSwipeEnabled(false);
    setDisableNotiBar(true);
    later(() => {
      playAnimation(text, 1, 600);
      setPlaying(true);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solving]);

  // Leaving the app stops the reading.
  useEffect(() => {
    if (appState !== 'foreground') setPlaying(false);
  }, [appState]);

  const duck = (on: boolean) => music?.setVolume(on ? 0 : MUSIC_VOLUME);

  const clearAudio = () => {
    setCurrentTime(0);
    duck(false);
    if (clock.current) clearInterval(clock.current);
    clock.current = null;
    if (sound.current) {
      sound.current.stop();
      sound.current.release();
      sound.current = null;
    }
  };

  // Reading: the lines appear as the recording passes their start time.
  useEffect(() => {
    if (!playing) {
      playAnimation(image, 1, 0);
      return;
    }
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    duck(true);
    playAnimation(image, 0, 0);
    const lastStart = Math.max(0, ...data.content.map(line => line.startTime));
    let cancelled = false;

    const finish = () => {
      playAnimation(image, 1, 600);
      later(() => {
        setState(2);
        setSolving(false);
        setPlaying(false);
        callbacks.current.onComplete();
        if (callbacks.current.advancesStory) triggerAction({ app: 'objective', delay: 1000 });
      }, 1000);
    };

    // No recording shipped for placeholder entries: read the lines on a timer instead.
    const readOnTimer = () => {
      const started = Date.now();
      clock.current = setInterval(() => {
        const elapsed = (Date.now() - started) / 1000;
        setCurrentTime(elapsed);
        if (elapsed >= lastStart + 3) {
          if (clock.current) clearInterval(clock.current);
          clock.current = null;
          finish();
        }
      }, 200);
    };

    sound.current = createSound(data.audio, s => {
      if (cancelled) {
        if (s !== 'error') s.release();
        return;
      }
      const usable = s !== 'error' && typeof s.getCurrentTime === 'function' && s.getDuration() >= lastStart;
      if (s === 'error' || !usable) {
        if (s !== 'error') s.release();
        sound.current = null;
        readOnTimer();
        return;
      }
      s.setVolume(1);
      s.play(success => {
        if (success) finish();
      });
      clock.current = setInterval(() => s.getCurrentTime(seconds => setCurrentTime(seconds)), 200);
    });

    return () => {
      cancelled = true;
      clearAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const onSolve = () => {
    if (soundsEnabled) playSound('unlock.mp3');
    later(() => setSolvedPage(number - 1), 400);
    setSolving(true);
  };

  const onBack = () => {
    if (soundsEnabled) playSound('paper.mp3');
    playAnimation(header, 0, 100);
    playAnimation(text, 0, 100);
    playAnimation(puzzle, 0, 100);
    close();
  };

  const shown = data.content
    .filter(line => line.startTime <= currentTime)
    .map(line => line.content)
    .join(' ');
  const full = data.content.map(line => line.content).join(' ');
  const strings = (key: string) => getAppString('herphone', 'diary', key);

  return (
    <View style={[styles.parentLayout, { height: H - H * 0.06 - insets.top }]}>
      <Animated.View style={[styles.header, { height: H * 0.05, opacity: header }]}>
        <CustomButton style={styles.button} disabled={false} silent onPress={onBack}>
          <CustomImage width="100%" height="100%" source={assets.diary.back} style={{ opacity: solving ? 0 : 1 }} />
        </CustomButton>
        <CustomText
          noDefaultMargin
          variant="h3"
          text={`${strings('page')} ${number} - ${data.date}`}
          color="#54401F"
          style={{ fontFamily: 'Caveat-Regular' }}
        />
        <CustomButton style={styles.button} disabled={state !== 2 || solving} onPress={() => setPlaying(p => !p)}>
          <CustomImage
            width="100%"
            height="100%"
            source={playing ? assets.diary.stop : assets.diary.play}
            style={{ opacity: state === 2 && !solving ? 1 : 0 }}
          />
        </CustomButton>
      </Animated.View>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <CustomButton
          silent
          activeOpacity={1}
          style={{ width: '99%', height: state !== 2 ? H * 0.94 : 'auto', minHeight: H * 0.94 }}>
          <Animated.View style={[styles.entry, { opacity: text }]}>
            <View style={{ width: '100%' }}>
              {playing ? <ContentAnimation content={shown} /> : null}
              <View style={{ opacity: playing || solving ? 0 : 1 }}>
                <Content content={full} />
              </View>
            </View>
            {data.image ? (
              <Animated.View
                style={{
                  width: data.image.width as `${number}%`,
                  aspectRatio: data.image.aspectRatio,
                  marginVertical: '5%',
                  marginLeft: '1%',
                  opacity: image,
                }}>
                <CustomImage width="100%" height="100%" resizeMode="stretch" source={getAppImage('diary', data.image.name)} />
              </Animated.View>
            ) : null}
          </Animated.View>
          <Animated.View pointerEvents={state === 2 ? 'none' : 'box-none'} style={[styles.puzzle, { opacity: puzzle }]}>
            <Riddle data={data} onSolve={onSolve} />
          </Animated.View>
        </CustomButton>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { position: 'absolute', width: W, flexDirection: 'column', zIndex: 100 },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '3.5%',
    marginTop: '4%',
  },
  content: { width: '100%', flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingTop: '2%', paddingBottom: '8%' },
  button: { width: '10%', aspectRatio: 1 },
  entry: { width: '100%', marginVertical: '1%', paddingHorizontal: '3%', paddingLeft: '5%' },
  puzzle: {
    position: 'absolute',
    left: 0,
    width: W,
    height: H * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.padding,
  },
});
