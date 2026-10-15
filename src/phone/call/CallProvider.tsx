import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import { createSound, GameSound, playSound } from '../../audio/sound';
import { MUSIC_VOLUME, useMusic } from '../../audio/MusicProvider';
import { GlobalContext } from '../../state/GlobalProvider';
import { getCallScript, getObjective } from '../../content';
import contacts from '../../content/mock/contacts';
import { callContacts } from '../../content/mock/callHistory';
import { CallScriptX } from '../../content/mock/callTypes';
import { PhoneName } from '../../content/types';
import { DATE_FORMAT } from '../../utils/date';
import { CallInstance, toInstance } from './callScript';
import {
  CallContext,
  CallContextValue,
  CallElapsedTimeContext,
  CallMode,
  CallStatus,
  CallType,
  getFormattedTime,
  OngoingCall,
} from './callContext';
import { CallStateProvider } from './CallStateProvider';

export { CallContext, getFormattedTime };
export type { CallStatus, CallType, CallMode, OngoingCall, Caption } from './callContext';

const NO_ANSWER_TIME = 2000;
const RING_TIME = 2500;
const RESET_TIME = 2500;

const allContacts: Record<string, { name: string; number: string }> = { ...contacts, ...callContacts };

/** Contact key for a dialled number (a contact key itself is accepted too). */
export function findCallContact(numberOrKey: string) {
  if (allContacts[numberOrKey]) return numberOrKey;
  return Object.keys(allContacts).find(key => !!allContacts[key].number && allContacts[key].number === numberOrKey);
}

/** Display name for a contact key. */
export function getCallName(contact: string | undefined, fallback = '') {
  return (contact && allContacts[contact]?.name) || fallback;
}

/** Phone number of a contact key. */
export function getCallNumber(contact: string | undefined) {
  return contact ? allContacts[contact]?.number : undefined;
}

/** Ticks once a second while the call is connected; resets when it ends. */
function CallElapsedTimeProvider({ children }: { children: React.ReactNode }) {
  const { ongoing, status } = useContext(CallContext);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!ongoing || status !== 'talking') return;
    const tick = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => {
      clearInterval(tick);
      setElapsed(0);
    };
  }, [ongoing, status]);

  const value = useMemo(() => ({ elapsedTime: getFormattedTime(elapsed) }), [elapsed]);
  return <CallElapsedTimeContext.Provider value={value}>{children}</CallElapsedTimeContext.Provider>;
}

/**
 * Per-phone call engine: dial tone while ringing out, then the scripted conversation once
 * connected, the hang-up tone and a short "ended" beat before the call screen closes.
 */
export function CallProvider({ phone, children }: { phone: PhoneName; children: React.ReactNode }) {
  const { session, soundsEnabled, addCallRecord, triggerAction } = useContext(GlobalContext);
  const [ongoing, setOngoing] = useState<OngoingCall | null>(null);
  const [mode, setMode] = useState<CallMode>('app');
  const [instance, setInstance] = useState<CallInstance | null>(null);
  const [status, setStatus] = useState<CallStatus>('idle');
  const dialtone = useRef<GameSound | null>(null);
  const timers = useRef<{ connect?: ReturnType<typeof setTimeout>; fail?: ReturnType<typeof setTimeout>; reset?: ReturnType<typeof setTimeout> }>({});
  const music = useMusic();
  const current = useRef({ ongoing, status, music });
  current.current = { ongoing, status, music };

  const stopDialtone = useCallback(() => {
    dialtone.current?.stop();
    dialtone.current?.release();
    dialtone.current = null;
  }, []);

  const clearTimers = useCallback(() => {
    clearTimeout(timers.current.connect);
    clearTimeout(timers.current.fail);
    clearTimeout(timers.current.reset);
    timers.current = {};
  }, []);

  useEffect(
    () => () => {
      stopDialtone();
      clearTimers();
      if (current.current.ongoing) current.current.music?.setVolume(MUSIC_VOLUME);
    },
    [stopDialtone, clearTimers],
  );

  const endCall = useCallback(
    (silent?: boolean) => {
      if (!current.current.ongoing || current.current.status === 'ended') return;
      stopDialtone();
      clearTimers();
      setStatus('ended');
      current.current.music?.setVolume(MUSIC_VOLUME);
      if (soundsEnabled && !silent) playSound('hangup.mp3');
      timers.current.reset = setTimeout(() => {
        setMode('app');
        setOngoing(null);
        setInstance(null);
        setStatus('idle');
      }, RESET_TIME);
    },
    [soundsEnabled, stopDialtone, clearTimers],
  );

  const startCall = useCallback(
    (number: string, type: CallType) => {
      if (current.current.ongoing && current.current.status !== 'ended') return;
      clearTimers();
      stopDialtone();
      current.current.music?.setVolume(0);
      const contact = findCallContact(number);
      if (type === 'outgoing' && soundsEnabled) {
        dialtone.current = createSound('dialtone.mp3', s => {
          if (s === 'error') return;
          if (dialtone.current !== s) {
            s.release();
            return;
          }
          s.setNumberOfLoops(-1);
          s.play();
        });
      }
      const name = getCallName(contact, number);
      setMode('app');
      setInstance(null);
      setOngoing({ name, number, contact, type });
      setStatus('calling');

      const script = session && contact ? (getCallScript(phone, contact, session) as CallScriptX | null) : null;
      if (!script) {
        // Nobody picks up.
        timers.current.fail = setTimeout(() => {
          stopDialtone();
          endCall();
        }, NO_ANSWER_TIME);
        return;
      }

      const next = toInstance(script);
      timers.current.connect = setTimeout(
        () => {
          stopDialtone();
          if (type === 'outgoing' && !next.dontSave) {
            addCallRecord(phone, {
              name,
              contact,
              number,
              time: (session && getObjective(session)?.date) || moment().format(DATE_FORMAT),
              timestamp: moment().format(),
              type: 'outgoing',
            });
          }
          setInstance(next);
          setStatus('talking');
          if (next.action) triggerAction(next.action);
        },
        type === 'incoming' ? 0 : next.delay ?? RING_TIME,
      );
    },
    [session, phone, soundsEnabled, endCall, addCallRecord, triggerAction, stopDialtone, clearTimers],
  );

  const value = useMemo<CallContextValue>(
    () => ({ ongoing, mode, setMode, instance, status, startCall, endCall }),
    [ongoing, mode, instance, status, startCall, endCall],
  );

  return (
    <CallContext.Provider value={value}>
      <CallElapsedTimeProvider>
        <CallStateProvider>{children}</CallStateProvider>
      </CallElapsedTimeProvider>
    </CallContext.Provider>
  );
}
