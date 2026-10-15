import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { GlobalContext } from '../../state/GlobalProvider';
import { playSound } from '../../audio/sound';
import { playAnimation } from '../../theme/animation';
import { CallReply, CallState } from '../../content/mock/callTypes';
import { CallContext, CallStateContext, CallStateValue, Caption } from './callContext';

const START_DELAY = 300;
const END_DELAY = 400;
const VOICE_STEP = 120;

/**
 * Plays the connected call's script as a state machine: each state shows its lines as live
 * captions (the caller's avatar pulses like a voice level), then moves on to the next state,
 * offers replies, waits for keypad digits, offers screen sharing or hangs up.
 */
export function CallStateProvider({ children }: { children: React.ReactNode }) {
  const { triggerAction, soundsEnabled } = useContext(GlobalContext);
  const { ongoing, status, instance, setMode, endCall } = useContext(CallContext);
  const [caption, setCaption] = useState<Caption>(null);
  const [options, setOptions] = useState<CallReply[] | null>(null);
  const [stateWithInput, setStateWithInput] = useState<CallState | null>(null);
  const [shareScreen, setShareScreen] = useState<CallState['shareScreen'] | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [visualizerAnim] = useState(() => new Animated.Value(1));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const digits = useRef('');

  // Latest values for the long-lived engine below.
  const live = useRef({ instance, endCall, setMode, triggerAction, soundsEnabled, options, stateWithInput, shareScreen });
  live.current = { instance, endCall, setMode, triggerAction, soundsEnabled, options, stateWithInput, shareScreen };

  const engine = useMemo(() => {
    const later = (fn: () => void, ms: number) => {
      timers.current.push(setTimeout(fn, ms));
    };

    const stop = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      digits.current = '';
      live.current.stateWithInput = null;
      setCaption(null);
      setOptions(null);
      setStateWithInput(null);
      setShareScreen(null);
      setSpeaking(false);
    };

    const finish = (state: CallState) => {
      // A phone menu keeps its prompt on screen while it waits for digits.
      if (!state.inputs?.length) setCaption(null);
      setSpeaking(false);
      if (state.next) run(state.next);
      if (state.replies?.length) setOptions(state.replies);
      if (state.inputs?.length) {
        live.current.stateWithInput = state;
        setStateWithInput(state);
      }
      if (state.shareScreen) setShareScreen(state.shareScreen);
      if (state.end) later(() => live.current.endCall(), END_DELAY);
      if (state.action) live.current.triggerAction(state.action);
    };

    const speak = (state: CallState) => {
      let at = 0;
      setSpeaking(true);
      state.lines.forEach(line => {
        later(() => setCaption(line.text ? { text: line.text, speaker: line.speaker } : null), at);
        at += line.duration;
      });
      later(() => finish(state), at);
    };

    const run = (id?: string) => {
      const state = id ? live.current.instance?.states[id] : undefined;
      if (!state) return;
      stop();
      if (state.mode === 'floating') live.current.setMode('floating');
      later(() => speak(state), state.delay ?? START_DELAY);
    };

    return { later, stop, run };
  }, []);

  // The call connected: play the script from its first state.
  useEffect(() => {
    if (ongoing && instance) engine.run('#0');
  }, [ongoing, instance, engine]);

  // Hung up (or reset): drop captions, replies and pending lines.
  useEffect(() => {
    if (status === 'ended' || status === 'idle') engine.stop();
  }, [status, engine]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  // Voice level: refreshed every 120 ms while someone is speaking.
  useEffect(() => {
    if (!speaking) {
      visualizerAnim.stopAnimation();
      visualizerAnim.setValue(1);
      return;
    }
    const tick = () => playAnimation(visualizerAnim, 1 + Math.round(Math.random() * 3) / 10, VOICE_STEP, Easing.linear);
    tick();
    const interval = setInterval(tick, VOICE_STEP);
    return () => clearInterval(interval);
  }, [speaking, visualizerAnim]);

  const selectReply = useCallback(
    (index: number) => {
      const next = live.current.options?.[index]?.next;
      if (next) engine.run(next);
      else engine.later(() => live.current.endCall(), END_DELAY);
    },
    [engine],
  );

  const pressDigit = useCallback(
    (digit: string) => {
      const state = live.current.stateWithInput;
      if (!state?.inputs) return;
      digits.current += digit;
      const match = state.inputs.find(input => digits.current.includes(input.keys));
      if (match) engine.run(match.next);
      else if (state.inputLimit && digits.current.length >= state.inputLimit) live.current.endCall();
    },
    [engine],
  );

  const shareYourScreen = useCallback(() => {
    const share = live.current.shareScreen;
    if (!share) return;
    if (live.current.soundsEnabled) playSound('tone.mp3');
    setShareScreen(null);
    if (share.action) live.current.triggerAction(share.action);
    if (share.next) engine.run(share.next);
    else engine.later(() => live.current.endCall(), END_DELAY);
  }, [engine]);

  const value = useMemo<CallStateValue>(
    () => ({
      caption,
      options,
      visualizerAnim,
      stateWithInput,
      shareScreen,
      executeState: engine.run,
      selectReply,
      pressDigit,
      shareYourScreen,
    }),
    [caption, options, visualizerAnim, stateWithInput, shareScreen, engine, selectReply, pressDigit, shareYourScreen],
  );

  return <CallStateContext.Provider value={value}>{children}</CallStateContext.Provider>;
}
