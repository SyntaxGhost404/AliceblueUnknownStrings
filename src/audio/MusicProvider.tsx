import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { createSound, GameSound } from './sound';
import { GlobalContext } from '../state/GlobalProvider';
import { isMusicOn } from '../content';

export const MusicContext = createContext<null>(null);

/**
 * Background score: a single quiet loop that plays during the parts of the story that
 * call for it, follows the music toggle and pauses while the app is backgrounded.
 */
export function MusicProvider({ children }: { children: React.ReactNode }) {
  const appState = useRef(AppState.currentState);
  const { session, event, musicEnabled, setAppState } = useContext(GlobalContext);
  const [loaded, setLoaded] = useState(false);
  const music = useRef<GameSound | null>(null);

  useEffect(() => {
    const sound = createSound('lexin.mp3', s => {
      if (s === 'error') return;
      s.setVolume(0.1);
      s.setNumberOfLoops(-1);
      setLoaded(true);
    });
    music.current = sound;
    return () => {
      sound.release();
    };
  }, []);

  useEffect(() => {
    const sound = music.current;
    if (!session || !loaded || !sound) return;
    const shouldPlay = !event?.showTimeline && isMusicOn(session);
    if (!shouldPlay) sound.pause();
    else if (musicEnabled) sound.play();
    else sound.pause();

    const subscription = AppState.addEventListener('change', next => {
      if ((appState.current ?? '').match(/inactive|background/) && next === 'active') {
        setAppState('foreground');
        if (shouldPlay && musicEnabled) sound.play();
      } else {
        setAppState('background');
        if (shouldPlay) sound.pause();
      }
      appState.current = next;
    });
    return () => subscription.remove();
    // Same trigger set as the reference build: progress, toggle and readiness.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, musicEnabled, loaded]);

  return <MusicContext.Provider value={null}>{children}</MusicContext.Provider>;
}
