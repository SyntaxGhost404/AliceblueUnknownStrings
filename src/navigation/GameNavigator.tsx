import React, { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, I18nManager } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { GlobalContext } from '../state/GlobalProvider';
import { ContentContext } from '../state/ContentProvider';
import { playSound } from '../audio/sound';
import { getObjective } from '../content';
import { PhoneName } from '../content/types';
import PhoneWrapper from '../phone/PhoneWrapper';
import { CallProvider } from '../phone/call/CallProvider';
import Desk from '../screens/desk/Desk';
import HintReminder from '../overlays/HintReminder';
import Objective from '../overlays/Objective';
import Toast from '../overlays/Toast';
import GameplayHost from '../overlays/gameplay/GameplayHost';
import ModalsHost from '../overlays/modals/ModalsHost';
import { GameUIContext, OVERLAY_KEYS, OverlayKey } from './GameUIContext';

const Tab = createMaterialTopTabNavigator();

/** How often the "Stuck? Take a hint" reminder resurfaces while hints are left. */
const HINT_REMINDER_INTERVAL = 200000;

const screens = I18nManager.isRTL ? ['herphone', 'myphone', 'suspectboard'] : ['suspectboard', 'myphone', 'herphone'];

/**
 * The game: a swipeable pager over the desk and the two phones (Adam's in the middle),
 * plus the overlays that sit on top of all three.
 */
function GameNavigator() {
  const {
    session,
    toast,
    hint,
    swipeEnabled,
    setSwipeEnabled,
    soundsEnabled,
    gameVisible,
    setGameVisible,
    timeTravel,
    overlayRequest,
  } = useContext(GlobalContext);
  const { getMainStoryEvent } = useContext(ContentContext);
  const [hideGame, setHideGame] = useState(true);
  const [showNavigator, setHideNavigatorState] = useState(true);
  const [scaleAnim] = useState(() => new Animated.Value(1));
  const [showObjective, setShowObjective] = useState(false);
  const [showHintReminder, setShowHintReminder] = useState(false);
  const [overlays, setOverlays] = useState<Partial<Record<OverlayKey, any>>>({});
  const [longPressUI, setLongPressUI] = useState<any>(null);
  const hintTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useFocusEffect(
    useCallback(() => {
      setGameVisible(true);
      const reveal = setTimeout(() => setHideGame(false), 500);
      return () => {
        clearTimeout(reveal);
        setGameVisible(false);
      };
    }, [setGameVisible]),
  );

  // Swiping between the desk and the phones is allowed except while time-travelling.
  useEffect(() => {
    setSwipeEnabled(!timeTravel);
  }, [timeTravel, setSwipeEnabled]);

  // A new objective chimes and drops its banner in.
  const lastObjective = useRef<string | null>(null);
  useEffect(() => {
    if (!session || !gameVisible || !showNavigator) return;
    const key = `${session.episode}:${session.objective}`;
    if (lastObjective.current === key) return;
    const first = lastObjective.current === null;
    lastObjective.current = key;
    const objective: any = getObjective(session);
    if (!objective) return;
    if (first && session.episode === 0 && session.objective === 0 && session.checkpoint > 0) return;
    if (!objective.soundDisabled && soundsEnabled) playSound('objective.mp3');
    if (!objective.popupDisabled) {
      const show = setTimeout(() => setShowObjective(true), 500);
      return () => clearTimeout(show);
    }
  }, [session, gameVisible, showNavigator, soundsEnabled]);

  // Hint reminder cadence.
  useEffect(() => {
    const hints: string[] = (getMainStoryEvent(session, false) as any)?.hints ?? [];
    setShowHintReminder(false);
    if (hintTimer.current) clearInterval(hintTimer.current);
    if (hint < 3 && hints.length > hint) {
      hintTimer.current = setInterval(() => setShowHintReminder(true), HINT_REMINDER_INTERVAL);
    }
    return () => {
      if (hintTimer.current) clearInterval(hintTimer.current);
    };
  }, [hint, session, getMainStoryEvent]);

  const showOverlay = useCallback((key: OverlayKey, data: any = true) => {
    setOverlays(prev => ({ ...prev, [key]: data }));
  }, []);
  const hideOverlay = useCallback((key: OverlayKey) => {
    setOverlays(prev => ({ ...prev, [key]: false }));
  }, []);
  const toggle = (key: OverlayKey) => (value: any) => (value ? showOverlay(key, value) : hideOverlay(key));

  // Story actions can open overlays too ({ app: 'overlay', overlay: 'timeline', data }).
  useEffect(() => {
    if (overlayRequest && (OVERLAY_KEYS as readonly string[]).includes(overlayRequest.key)) {
      showOverlay(overlayRequest.key as OverlayKey, overlayRequest.data);
    }
  }, [overlayRequest, showOverlay]);

  const ui = {
    overlays,
    showOverlay,
    hideOverlay,
    setShowObjective,
    setShowHintReminder,
    setShowCredits: toggle('credits'),
    setShowNewEpisodeModal: toggle('newEpisodeModal'),
    setShowStartNextEpisode: toggle('startNextEpisode'),
    setShowCloudSaves: toggle('cloudSaves'),
    setShowResetProgress: toggle('resetProgress'),
    setShowLanguage: toggle('language'),
    setShowNeedHelp: toggle('needHelp'),
    setShowTimeline: toggle('timeline'),
    setFloatingNote: toggle('floatingNote'),
    setTimerData: toggle('timer'),
    setHideGame,
    setHideNavigator: (hide: boolean) => setHideNavigatorState(!hide),
    setMindPalace: toggle('mindPalace'),
    setLongPressUI,
    longPressUI,
  };

  return (
    <GameUIContext.Provider value={ui}>
      <Animated.View style={{ flex: 1, opacity: hideGame ? 0 : 1, transform: [{ scale: scaleAnim }] }}>
        <Tab.Navigator
          initialRouteName="myphone"
          tabBar={() => null}
          screenOptions={{
            swipeEnabled,
            sceneStyle: { backgroundColor: 'transparent', opacity: showNavigator ? 1 : 0 },
          }}>
          {screens.map(screen => (
            <Tab.Screen key={screen} name={screen}>
              {() =>
                screen === 'suspectboard' ? (
                  <Desk />
                ) : (
                  <CallProvider phone={screen as PhoneName}>
                    <PhoneWrapper name={screen as PhoneName} />
                  </CallProvider>
                )
              }
            </Tab.Screen>
          ))}
        </Tab.Navigator>
        {showHintReminder ? <HintReminder setShowHintReminder={setShowHintReminder} /> : null}
        {toast ? <Toast text={toast} /> : null}
        {showObjective ? <Objective setShowObjective={setShowObjective} /> : null}
        <GameplayHost />
        <ModalsHost />
      </Animated.View>
    </GameUIContext.Provider>
  );
}

export default memo(GameNavigator);
