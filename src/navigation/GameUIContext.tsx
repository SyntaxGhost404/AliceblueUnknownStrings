import { createContext, useContext } from 'react';

/**
 * Overlay switches owned by the game navigator. The reference build threaded each of these
 * setters through every phone/app as props; a context keeps the same wiring without the
 * drilling.
 */
export type GameUI = {
  setShowObjective: (v: boolean) => void;
  setShowHintReminder: (v: boolean) => void;
  setShowCredits: (v: boolean) => void;
  setShowNewEpisodeModal: (v: boolean) => void;
  setShowStartNextEpisode: (v: boolean) => void;
  setShowCloudSaves: (v: boolean) => void;
  setShowResetProgress: (v: boolean) => void;
  setShowLanguage: (v: boolean) => void;
  setShowNeedHelp: (v: boolean) => void;
  setShowTimeline: (v: boolean) => void;
  setFloatingNote: (v: any) => void;
  setTimerData: (v: any) => void;
  setHideGame: (v: boolean) => void;
  setHideNavigator: (v: boolean) => void;
  setMindPalace: (v: boolean) => void;
  setLongPressUI: (v: any) => void;
  longPressUI: any;
};

const noop = () => {};

export const GameUIContext = createContext<GameUI>({
  setShowObjective: noop,
  setShowHintReminder: noop,
  setShowCredits: noop,
  setShowNewEpisodeModal: noop,
  setShowStartNextEpisode: noop,
  setShowCloudSaves: noop,
  setShowResetProgress: noop,
  setShowLanguage: noop,
  setShowNeedHelp: noop,
  setShowTimeline: noop,
  setFloatingNote: noop,
  setTimerData: noop,
  setHideGame: noop,
  setHideNavigator: noop,
  setMindPalace: noop,
  setLongPressUI: noop,
  longPressUI: null,
});

export const useGameUI = () => useContext(GameUIContext);
