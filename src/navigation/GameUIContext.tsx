import { createContext, useContext } from 'react';

/**
 * Game overlays drawn above the desk and both phones. Each key's value is `false`/absent
 * when closed, or `true`/a payload object when open.
 *
 * Menu-style modals (rendered by overlays/modals/ModalsHost):
 *   cloudSaves, resetProgress, language, needHelp, credits, newEpisodeModal,
 *   startNextEpisode, prologueEnd
 * In-game overlays (rendered by overlays/gameplay/GameplayHost):
 *   transition, flashback, fade, timer, floatingNote, timeSkip, timeline, mindPalace,
 *   quickDeduce, floatingHints
 */
export const OVERLAY_KEYS = [
  'cloudSaves',
  'resetProgress',
  'language',
  'needHelp',
  'credits',
  'newEpisodeModal',
  'startNextEpisode',
  'prologueEnd',
  'transition',
  'flashback',
  'fade',
  'timer',
  'floatingNote',
  'timeSkip',
  'timeline',
  'mindPalace',
  'quickDeduce',
  'floatingHints',
] as const;

export type OverlayKey = (typeof OVERLAY_KEYS)[number];

/**
 * Overlay switches owned by the game navigator. The reference build threaded each of these
 * setters through every phone/app as props; a context keeps the same wiring without the
 * drilling.
 */
export type GameUI = {
  /** Which overlays are open, and with what payload. */
  overlays: Partial<Record<OverlayKey, any>>;
  showOverlay: (key: OverlayKey, data?: any) => void;
  hideOverlay: (key: OverlayKey) => void;
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
  overlays: {},
  showOverlay: noop,
  hideOverlay: noop,
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
