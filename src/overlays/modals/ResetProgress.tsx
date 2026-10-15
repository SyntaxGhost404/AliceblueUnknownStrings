import React, { useContext, useEffect, useState } from 'react';
import { I18nManager, StyleSheet, View } from 'react-native';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomModal from '../../components/CustomModal';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { GlobalContext } from '../../state/GlobalProvider';
import { getGeneral } from '../../content/general';
import { copy, wipeCaption } from '../../content/mock/modals';
import { useDismiss, useRestartGame, useTimers } from './hooks';

/** Seconds the "Confirm" button stays locked after pressing "Reset". */
const COUNTDOWN = 10;

type SectionProps = {
  title: string;
  checked: boolean;
  onToggle: () => void;
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  caption?: string;
  captionStyle?: { color: string; marginTop?: string };
};

/** One resettable part of the game: a checkbox, a "< label >" picker and what else the reset wipes. */
function ResetSection({ title, checked, onToggle, label, onPrevious, onNext, caption, captionStyle }: SectionProps) {
  const Back = I18nManager.isRTL ? ChevronRight : ChevronLeft;
  const Forward = I18nManager.isRTL ? ChevronLeft : ChevronRight;
  return (
    <View style={[styles.section, { opacity: checked ? 1 : 0.3 }]}>
      <View style={styles.sectionTitle}>
        <CustomText gray bold center noDefaultMargin style={{ marginRight: scale(11.8), paddingBottom: '1%' }} text={title} />
        <CustomButton
          style={[styles.checkButton, { backgroundColor: checked ? theme.colors.white : 'transparent' }]}
          onPress={onToggle}
        >
          <Check style={{ opacity: checked ? 1 : 0 }} color="#070A0C" size={scale(14)} />
        </CustomButton>
      </View>
      <View pointerEvents={checked ? 'auto' : 'none'} style={styles.selector}>
        <CustomButton style={styles.selectorButton} onPress={onPrevious}>
          <Back color={theme.colors.white} size={scale(16)} />
        </CustomButton>
        <CustomText white text={label} />
        <CustomButton style={styles.selectorButton} onPress={onNext}>
          <Forward color={theme.colors.white} size={scale(16)} />
        </CustomButton>
      </View>
      {caption ? (
        <CustomText
          center
          variant="caption"
          color={captionStyle?.color ?? theme.colors.black3}
          style={captionStyle?.marginTop ? { marginTop: captionStyle.marginTop } : undefined}
          text={caption}
        />
      ) : null}
    </View>
  );
}

/** Names of the units after `selected` up to `last`, e.g. ["Episode 3", "Episode 4"]. */
const laterUnits = (name: string, selected: number, last: number) =>
  Array.from({ length: Math.max(0, last - selected) }, (_, i) => `${name} ${selected + 1 + i}`);

/**
 * "Reset progress" dialog. Pick what to reset, press "Reset", then wait out a 10 second
 * countdown before "Confirm" unlocks. The reference build restarted the app afterwards; here
 * the story restarts from the beginning (the only reset the engine offers) and the game goes
 * back to the splash screen.
 */
export default function ResetProgress({ onClose }: { onClose: () => void }) {
  const { session, sidetrailsSession, sidetrailsEvent, resetProgress } = useContext(GlobalContext);
  const restart = useRestartGame();
  const later = useTimers();

  // Latest episode that can be reset: the current one once started, else the one before it.
  const lastEpisode = session && session.objective !== 0 ? session.episode : Math.max(0, (session?.episode ?? 0) - 1);
  // Sidetrails don't exist in this build; the section appears once the engine reports a trail.
  const lastTrail: number = sidetrailsSession
    ? sidetrailsEvent?.startSidetrail
      ? sidetrailsSession.trail
      : sidetrailsSession.trail + 1
    : 0;
  const firstEpisode = lastEpisode === 0 ? 0 : 1;

  const [mainStory, setMainStory] = useState(false);
  const [sidetrails, setSidetrails] = useState(false);
  const [episode, setEpisode] = useState(lastEpisode);
  const [trail, setTrail] = useState<number>(lastTrail);
  const [counting, setCounting] = useState(false);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN);
  const [resetting, setResetting] = useState(false);
  const { modalKey, dismiss } = useDismiss(resetting, onClose);

  // Changing what gets reset starts the confirmation over.
  useEffect(() => {
    setCounting(false);
    setReady(false);
    setCountdown(COUNTDOWN);
  }, [mainStory, sidetrails, episode, trail]);

  useEffect(() => {
    if (!counting) return;
    const id = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [counting]);

  useEffect(() => {
    if (counting && countdown <= 0) {
      setCounting(false);
      setReady(true);
    }
  }, [counting, countdown]);

  const onReset = () => {
    setCountdown(COUNTDOWN);
    setCounting(true);
  };

  const onConfirm = async () => {
    setResetting(true);
    if (mainStory) await resetProgress();
    later(restart, 700);
  };

  const nothingSelected = !mainStory && !sidetrails;
  const progress = getGeneral.bind(null, 'progress');
  const episodeLabel = episode === 0 ? copy.prologue : `${progress('episode')} ${episode}`;
  const wipedEpisodes = laterUnits(progress('episode'), episode, lastEpisode);
  const wipedTrails = laterUnits(copy.sidetrail, trail, lastTrail);

  return (
    <CustomModal key={modalKey} visible setVisible={dismiss}>
      <View style={styles.container} pointerEvents={resetting ? 'none' : 'auto'}>
        <CustomText bold error center gameText text={progress('reset_progress')} />
        <CustomText variant="caption" color={theme.colors.red} center text={progress('irreversible_action')} />
        <CustomText variant="caption" color={theme.colors.black3} center text={progress('call_history')} />
        <ResetSection
          title={progress('main_story')}
          checked={mainStory}
          onToggle={() => setMainStory(v => !v)}
          label={episodeLabel}
          onPrevious={() => setEpisode(e => (e !== firstEpisode ? e - 1 : e))}
          onNext={() => setEpisode(e => (e !== lastEpisode ? e + 1 : e))}
          caption={episode < lastEpisode ? wipeCaption(episodeLabel, wipedEpisodes) : undefined}
        />
        {lastTrail !== 0 ? (
          <ResetSection
            title={progress('sidetrails')}
            checked={sidetrails}
            onToggle={() => setSidetrails(v => !v)}
            label={`${copy.sidetrail} ${trail}`}
            onPrevious={() => setTrail(t => (t !== 1 ? t - 1 : t))}
            onNext={() => setTrail(t => (t !== lastTrail ? t + 1 : t))}
            caption={trail < lastTrail ? wipeCaption(`${copy.sidetrail} ${trail}`, wipedTrails) : undefined}
            captionStyle={{ color: '#FFFFFF33', marginTop: '4%' }}
          />
        ) : null}
        {resetting ? (
          <CustomText
            variant="caption"
            color={theme.colors.black3}
            center
            style={{ fontFamily: 'JosefinSans-Regular' }}
            text={copy.resetting}
          />
        ) : null}
        <View style={{ flexDirection: 'row', width: '92%', justifyContent: 'space-between' }}>
          <CustomButton style={styles.progressButton} onPress={onClose}>
            <CustomText variant="subtext" gray text={progress('cancel')} />
          </CustomButton>
          <CustomButton
            disabled={nothingSelected || counting}
            style={[
              styles.progressButton,
              {
                backgroundColor: counting || ready ? theme.colors.red : '#FFFFFF0C',
                opacity: nothingSelected || counting ? 0.4 : 1,
              },
            ]}
            onPress={ready ? onConfirm : onReset}
          >
            <CustomText
              variant="subtext"
              white
              text={counting || ready ? `${copy.confirm}${counting ? ` (${countdown})` : ''}` : progress('reset')}
            />
          </CustomButton>
        </View>
      </View>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '88%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '6%',
    paddingVertical: '5%',
    backgroundColor: '#070A0C',
    borderRadius: scale(16),
  },
  section: { width: '100%', justifyContent: 'center', alignItems: 'center', marginVertical: '5%' },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: '4%' },
  checkButton: {
    padding: scale(2.9),
    borderWidth: scale(1),
    borderColor: theme.colors.white,
    borderRadius: scale(100),
  },
  selector: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF0C',
    borderRadius: scale(100),
  },
  selectorButton: { paddingHorizontal: '6%', paddingVertical: '6%' },
  progressButton: {
    width: '48%',
    borderWidth: scale(1),
    borderColor: '#FFFFFF17',
    borderRadius: scale(40),
    marginVertical: '2%',
    paddingHorizontal: '2%',
    paddingVertical: '4%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
