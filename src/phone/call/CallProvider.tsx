import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { createSound, GameSound } from '../../audio/sound';
import { GlobalContext } from '../../state/GlobalProvider';
import { getCallScript, getProfileName } from '../../content';
import contacts from '../../content/mock/contacts';
import { CallLine, CallScript, PhoneName } from '../../content/types';

export type CallStatus = 'idle' | 'calling' | 'ongoing' | 'ended';
export type CallType = 'incoming' | 'outgoing';
export type OngoingCall = { name: string; number: string; contact?: string; type: CallType };
export type Caption = { speaker?: string; text: string } | null;
export type CallOption = NonNullable<CallScript['options']>[number];

export type CallState = {
  ongoing: OngoingCall | null;
  /** `app` while the call screen is open, `floating` once minimised to the call bubble. */
  mode: 'app' | 'floating';
  setMode: (mode: 'app' | 'floating') => void;
  callData: CallScript | null;
  status: CallStatus;
  /** Line being spoken right now. */
  caption: Caption;
  /** Seconds since the call connected. */
  elapsed: number;
  options: CallOption[] | null;
  chooseOption: (index: number) => void;
  startCall: (number: string, type: CallType) => void;
  endCall: () => void;
};

export const CallContext = createContext<CallState>({
  ongoing: null,
  mode: 'app',
  setMode: () => {},
  callData: null,
  status: 'idle',
  caption: null,
  elapsed: 0,
  options: null,
  chooseOption: () => {},
  startCall: () => {},
  endCall: () => {},
});

/** "m:ss" timer used on the call screen and the call bubble. */
export function getFormattedTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

let dialtone: GameSound | null = null;

/**
 * Per-phone call engine: dial tone while ringing out, then the scripted conversation once
 * connected (each spoken line becomes the live caption), timed reply options, the hang-up
 * tone and a short "Call ended" beat before the call screen closes.
 */
export function CallProvider({ phone, children }: { phone: PhoneName; children: React.ReactNode }) {
  const { session, setAppsData, soundsEnabled, triggerAction } = useContext(GlobalContext);
  const [ongoing, setOngoing] = useState<OngoingCall | null>(null);
  const [mode, setMode] = useState<'app' | 'floating'>('app');
  const [callData, setCallData] = useState<CallScript | null>(null);
  const [status, setStatus] = useState<CallStatus>('idle');
  const [caption, setCaption] = useState<Caption>(null);
  const [elapsed, setElapsed] = useState(0);
  const [options, setOptions] = useState<CallOption[] | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  useEffect(
    () => () => {
      dialtone?.release();
      clearTimers();
    },
    [],
  );

  useEffect(() => {
    if (status !== 'ongoing') return;
    const tick = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(tick);
  }, [status]);

  const endCall = useCallback(() => {
    dialtone?.release();
    dialtone = null;
    clearTimers();
    setCaption(null);
    setOptions(null);
    setStatus('ended');
    if (soundsEnabled) {
      createSound('hangup.mp3', s => {
        if (s !== 'error') s.play(() => s.release());
      });
    }
    later(() => {
      setMode('app');
      setOngoing(null);
      setCallData(null);
      setStatus('idle');
      setElapsed(0);
    }, 2500);
  }, [soundsEnabled]);

  const speak = useCallback((lines: CallLine[], speakerFallback: string | undefined, then: () => void) => {
    let at = 0;
    lines.forEach(line => {
      later(() => setCaption({ speaker: line.speaker ?? speakerFallback, text: line.text }), at);
      at += line.duration;
    });
    later(() => {
      setCaption(null);
      then();
    }, at);
  }, []);

  const startCall = useCallback(
    (number: string, type: CallType) => {
      clearTimers();
      const contact = Object.keys(contacts).find(key => contacts[key].number === number);
      if (type === 'outgoing' && soundsEnabled) {
        dialtone = createSound('dialtone.mp3', s => {
          if (s === 'error') return;
          s.setNumberOfLoops(-1);
          s.play();
        });
      }
      setOngoing({ name: contact ? getProfileName(contact) : number, number, contact, type });
      setStatus('calling');
      setElapsed(0);
      const script = session ? getCallScript(phone, contact, session) : null;
      setCallData(script);

      if (!script) {
        // Nobody picks up.
        later(() => {
          dialtone?.release();
          dialtone = null;
          endCall();
        }, 2000);
        return;
      }

      later(
        () => {
          dialtone?.release();
          dialtone = null;
          if (type === 'outgoing' && !script.dontSave) {
            setAppsData(prev => ({
              ...prev,
              [phone]: {
                ...prev[phone],
                call: [
                  {
                    name: contact ? getProfileName(contact) : number,
                    contact,
                    number,
                    time: '',
                    timestamp: moment().format(),
                    type: 'outgoing',
                  },
                  ...prev[phone].call,
                ],
              },
            }));
          }
          setStatus('ongoing');
          if (script.action) triggerAction(script.action);
          speak(script.lines, contact, () => {
            if (script.options?.length) setOptions(script.options);
            else later(endCall, 600);
          });
        },
        type === 'incoming' ? 0 : script.delay ?? 2500,
      );
    },
    [session, phone, soundsEnabled, endCall, setAppsData, speak, triggerAction],
  );

  const chooseOption = useCallback(
    (index: number) => {
      const option = options?.[index];
      if (!option) return;
      setOptions(null);
      speak(option.lines, ongoing?.contact, () => {
        if (option.action) triggerAction(option.action);
        later(endCall, 600);
      });
    },
    [options, ongoing, speak, triggerAction, endCall],
  );

  return (
    <CallContext.Provider
      value={{ ongoing, mode, setMode, callData, status, caption, elapsed, options, chooseOption, startCall, endCall }}>
      {children}
    </CallContext.Provider>
  );
}
