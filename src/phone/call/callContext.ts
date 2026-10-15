import { createContext } from 'react';
import { Animated } from 'react-native';
import { CallReply, CallState } from '../../content/mock/callTypes';
import { CallInstance } from './callScript';

export type CallStatus = 'idle' | 'calling' | 'talking' | 'ended';
export type CallType = 'incoming' | 'outgoing';
export type CallMode = 'app' | 'floating';
export type OngoingCall = { name: string; number: string; contact?: string; type: CallType };
export type Caption = { text: string; speaker?: string } | null;

export type CallContextValue = {
  ongoing: OngoingCall | null;
  /** `app` while the call screen is open, `floating` once minimised to the call bubble. */
  mode: CallMode;
  setMode: (mode: CallMode) => void;
  /** The script being played; set once the call connects. */
  instance: CallInstance | null;
  status: CallStatus;
  startCall: (number: string, type: CallType) => void;
  endCall: (silent?: boolean) => void;
};

export const CallContext = createContext<CallContextValue>({
  ongoing: null,
  mode: 'app',
  setMode: () => {},
  instance: null,
  status: 'idle',
  startCall: () => {},
  endCall: () => {},
});

export type CallStateValue = {
  /** Line being spoken right now. */
  caption: Caption;
  /** Replies waiting for the player. */
  options: CallReply[] | null;
  /** Voice level (1 = quiet) that drives the caller's pulse. */
  visualizerAnim: Animated.Value;
  /** A phone menu is waiting for keypad digits. */
  stateWithInput: CallState | null;
  /** "Share Your Screen" is on offer. */
  shareScreen: CallState['shareScreen'] | null;
  /** Runs a state of the script (the reply's `next`). */
  executeState: (id?: string) => void;
  /** Continues with the state behind reply `index`. */
  selectReply: (index: number) => void;
  /** Feeds a keypad digit to the phone menu. */
  pressDigit: (digit: string) => void;
  /** Taps the "Share Your Screen" button. */
  shareYourScreen: () => void;
};

export const CallStateContext = createContext<CallStateValue>({
  caption: null,
  options: null,
  visualizerAnim: new Animated.Value(1),
  stateWithInput: null,
  shareScreen: null,
  executeState: () => {},
  selectReply: () => {},
  pressDigit: () => {},
  shareYourScreen: () => {},
});

/** Elapsed call time as "mm:ss"; lives in its own context so only the timers re-render each second. */
export const CallElapsedTimeContext = createContext<{ elapsedTime: string }>({ elapsedTime: '00:00' });

/** "mm:ss" timer used on the call screen and the call bubble. */
export function getFormattedTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
