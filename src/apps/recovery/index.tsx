import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { I18nManager, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { createSound, GameSound } from '../../audio/sound';
import { GlobalContext } from '../../state/GlobalProvider';
import { getAppString } from '../../content/appStrings';
import { consoleLines, defaultJob, RecoveryJob } from '../../content/mock/recovery';
import { AppProps } from '../types';
import ConsoleLine from './ConsoleLine';
import puzzles from './puzzles';

/** Pause after the last console line before the puzzle appears. */
const PUZZLE_DELAY = 1400;
/** Pause before a stage starts printing. */
const STAGE_DELAY = 600;

const strings = (key: string) => getAppString('other', 'datarecovery', key);

/**
 * Data-recovery mode: a console types out its intro, a puzzle asks for manual input, and a
 * summary of what was restored closes the job. The job comes from whoever opens the app: a
 * recovery request from another app (route params or a queued job) or the story event.
 */
export default function Recovery({ phone, route, setNotiBarColor }: AppProps) {
  const navigation = useNavigation<any>();
  const { event, appsData, clearNotifications, setRecoveredApps, triggerAction, soundsEnabled } = useContext(GlobalContext);
  const colors = (theme as any)[phone].recovery.colors;

  const requested: RecoveryJob | undefined =
    route.params?.recovery ?? route.params?.params?.data?.recovery ?? appsData[phone].apps?.recovery?.job;
  const storyJob: RecoveryJob | undefined = (event as any)?.recovery;
  const job = requested ?? storyJob ?? defaultJob;
  const returnTo: string = route.params?.returnTo ?? job.returnTo ?? 'homescreen';
  const recovered: Record<string, string[]> | undefined = route.params?.recovered ?? job.recovered;

  const stageLines = useMemo(() => {
    const mark = I18nManager.isRTL ? '‏' : '‎';
    return [
      consoleLines,
      [] as string[],
      [strings('successfully_recovered'), ...job.recoveries.map(item => `${mark}${item.count} ${strings(item.type)}`)],
    ];
  }, [job]);

  const [lines, setLines] = useState(0);
  const [stage, setStage] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hum = useRef<GameSound | null>(null);
  const live = useRef({ lines: 0, stage: 0, stageLines, soundsEnabled });
  live.current.stage = stage;
  live.current.stageLines = stageLines;
  live.current.soundsEnabled = soundsEnabled;

  const later = (fn: () => void, delay: number) => {
    const timer = setTimeout(fn, delay);
    timers.current.push(timer);
    return timer;
  };

  useFocusEffect(
    useCallback(() => {
      setNotiBarColor(colors.notificationBar);
    }, [colors.notificationBar, setNotiBarColor]),
  );

  const stopHum = () => {
    hum.current?.stop();
    hum.current?.release();
    hum.current = null;
  };

  // The recovery hum loops while a stage is printing.
  const startHum = () => {
    if (!live.current.soundsEnabled || hum.current) return;
    hum.current = createSound('recovery.mp3', s => {
      if (s === 'error') return;
      s.setNumberOfLoops(-1);
      s.play();
    });
  };

  const runNextLine = useCallback(() => {
    const current = live.current;
    if (current.lines >= current.stageLines[current.stage].length) {
      stopHum();
      if (current.stage === 0) later(() => setStage(1), PUZZLE_DELAY);
      return;
    }
    current.lines += 1;
    if (current.lines === 1) startHum();
    setLines(current.lines);
  }, []);

  // Every printing stage starts from an empty console.
  useEffect(() => {
    if (stage === 1) {
      live.current.lines = 0;
      setLines(0);
      return;
    }
    live.current.lines = 0;
    setLines(0);
    const timer = later(runNextLine, STAGE_DELAY);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      stopHum();
    },
    [],
  );

  const onFinish = () => {
    clearNotifications(phone, n => n.id.startsWith('recovery'));
    if (recovered) {
      setRecoveredApps(prev => {
        const next: Record<string, string[]> = { ...(prev ?? {}) };
        Object.entries(recovered).forEach(([app, ids]) => {
          next[app] = [...new Set([...(next[app] ?? []), ...ids])];
        });
        return next;
      });
    }
    // Only a recovery the story itself started moves the story on.
    if (!requested && storyJob) triggerAction({ app: 'objective', delay: 100 });
    navigation.popTo(returnTo);
  };

  const Puzzle = puzzles[job.puzzle] ?? puzzles[0];
  const printed = stage !== 1 ? stageLines[stage].slice(0, lines) : [];
  const allPrinted = stage === 2 && lines === stageLines[stage].length;

  return (
    <View style={[styles.parentLayout, { backgroundColor: colors.background }]}>
      <Video
        repeat
        muted={!soundsEnabled}
        resizeMode="cover"
        source={assets.videos.recovery}
        style={[StyleSheet.absoluteFill, { opacity: 0.35 }]}
      />
      <View
        style={[
          styles.terminal,
          {
            borderWidth: stage === 2 && lines > 0 ? scale(1) : 0,
            paddingVertical: stage === 2 ? '3%' : 0,
            paddingHorizontal: '8%',
          },
        ]}>
        {printed.map((text, index) => (
          <ConsoleLine key={`${stage}-${index}`} text={text} runNextLine={runNextLine} bold />
        ))}
        {allPrinted ? (
          <CustomButton activeOpacity={0.6} onPress={onFinish} style={{ alignItems: 'center' }}>
            <CustomText mono center variant="text" color="#8BD17FCC" text={strings('click_finish')} />
          </CustomButton>
        ) : null}
      </View>
      {stage === 1 ? <Puzzle onSolve={() => setStage(2)} /> : null}
      {stage < 2 ? (
        <CustomButton activeOpacity={0.6} onPress={() => navigation.popTo(returnTo)} style={{ position: 'absolute', bottom: '7%' }}>
          <CustomText mono center variant="caption" color="#496177" text={`[${strings('exit').toLowerCase()}]`} />
        </CustomButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.padding as any },
  terminal: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(4),
    borderColor: '#8BD17FCC',
  },
});
