import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { createSound, GameSound } from './sound';
import { GlobalContext } from '../state/GlobalProvider';
import { isMusicOn } from '../content';

/** Score controls, as in the reference build: calls and voiced diary pages duck the music. */
export type MusicControls = {
  music: { setVolume: (volume: number) => void };
  setVolume: (volume: number) => void;
  playMusic: () => void;
  pauseMusic: () => void;
};

/** Normal score volume; `setVolume(MUSIC_VOLUME)` restores it after ducking. */
export const MUSIC_VOLUME = 0.1;

export const MusicContext = createContext<MusicControls | null>(null);

export const useMusic = () => useContext(MusicContext);

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
      s.setVolume(MUSIC_VOLUME);
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

  const controls = useMemo<MusicControls>(() => {
    const setVolume = (volume: number) => music.current?.setVolume(volume);
    return {
      music: { setVolume },
      setVolume,
      playMusic: () => {
        if (musicEnabled && session && isMusicOn(session)) music.current?.play();
      },
      pauseMusic: () => music.current?.pause(),
    };
  }, [musicEnabled, session]);

  return <MusicContext.Provider value={controls}>{children}</MusicContext.Provider>;
}
