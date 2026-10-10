import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { createSound, GameSound, playSound } from '../audio/sound';
import { deleteItem, retrieveItem, storeItem } from './storage';
import { getDate, getTime } from '../utils/date';
import {
  ChatNode,
  ChatOption,
  ForceNavigation,
  GameAction,
  GatherInfo,
  Notification,
  PhoneName,
  Screen,
  Session,
} from '../content/types';
import content, { getCheckpoint, getConversation, getObjective, progressPercentage } from '../content';
import { CloudSave, mockCloud, UserProfile } from './cloud';
import contacts from '../content/mock/contacts';

// ---------------------------------------------------------------------------------------------
// Types

export type ChatMessage = {
  id: string;
  /** Unique key for lists (node id may repeat across checkpoints). */
  transformedId: string;
  text: string;
  /** 0 = contact, 1 = player, -1 = system line. */
  type: number;
  sender?: string;
  time: string;
  gather?: string;
  deleted?: boolean;
};

export type PhoneData = {
  messages: Record<string, ChatMessage[]>;
  call: CallRecord[];
};

export type AppsData = Record<PhoneName, PhoneData>;

export type CallRecord = {
  name: string;
  contact?: string;
  number?: string;
  time: string;
  timestamp: string;
  type: 'incoming' | 'outgoing' | 'missed';
};

export type PendingOptions = { nodeId: string; options: ChatOption[] };

export type ChatState = {
  /** Who is currently typing in each chat (`${phone}:${chat}` -> sender id). */
  typing: Record<string, string | null>;
  /** Options waiting for the player, keyed like `typing`. */
  options: Record<string, PendingOptions | undefined>;
  /** Chats with messages the player hasn't opened yet. */
  unread: Record<string, boolean>;
};

type PerPhone<T> = Record<PhoneName, T>;

export type GlobalState = ReturnType<typeof useGlobalState>;

export const GlobalContext = createContext<GlobalState>(null as unknown as GlobalState);

const emptyAppsData = (): AppsData => ({
  myphone: { messages: {}, call: [] },
  herphone: { messages: {}, call: [] },
});

export const chatKey = (phone: PhoneName, chat: string) => `${phone}:${chat}`;

const nowStamp = () => moment().format();

// ---------------------------------------------------------------------------------------------

function useGlobalState() {
  // Settings ------------------------------------------------------------------------------------
  const [musicEnabled, setMusicEnabled] = useState<boolean | null>(null);
  const [soundsEnabled, setSoundsEnabled] = useState<boolean | null>(null);

  // Progress ------------------------------------------------------------------------------------
  const [session, setSession] = useState<Session | null>(null);
  const [launchScreen, setLaunchScreen] = useState<Screen | null>(null);
  const [locked, setLocked] = useState<PerPhone<boolean> | null>(null);
  const [appsData, setAppsData] = useState<AppsData>(emptyAppsData);
  const [notes, setNotes] = useState<string[] | null>(null);
  const [hint, setHint] = useState(0);
  const [recoveredApps, setRecoveredApps] = useState<Record<string, string[]> | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Live game state -----------------------------------------------------------------------------
  const [event, setEvent] = useState<any>(null);
  const [time, setTime] = useState('');
  const [date, setDate] = useState(getDate(''));
  const [notifications, setNotifications] = useState<PerPhone<Notification[]>>({ myphone: [], herphone: [] });
  const [popupNotification, setPopupNotification] = useState<PerPhone<Notification | null>>({
    myphone: null,
    herphone: null,
  });
  const [appState, setAppState] = useState<'foreground' | 'background'>('foreground');
  const [gameVisible, setGameVisible] = useState(false);
  const [gatherInfos, setGatherInfos] = useState<GatherInfo[] | null>(null);
  const [usersOnline, setUsersOnline] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [highlightInSuspectBoard, setHighlightInSuspectBoard] = useState<string | null>(null);
  const [BGColor, setBGColor] = useState('black');
  const [swipeEnabled, setSwipeEnabled] = useState(false);
  const [infoOnScreen, setInfoOnScreen] = useState<string | null>(null);
  const [forceNavigation, setForceNavigation] = useState<ForceNavigation | null>(null);
  const [batteryIcon, setBatteryIcon] = useState<'low' | 'medium' | 'full' | 'charging'>('medium');
  const [flashback, setFlashback] = useState<any>(null);
  const [ping, setPing] = useState(0);
  const [subtitle, setSubtitle] = useState<{ text: string } | null>(null);
  const [fade, setFade] = useState<any>(null);
  const [chat, setChat] = useState<ChatState>({ typing: {}, options: {}, unread: {} });

  const chatFocused = useRef<string | null>(null);
  const soundsRef = useRef(soundsEnabled);
  soundsRef.current = soundsEnabled;
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const loopingSounds = useRef<{ id: string; audio: GameSound }[]>([]);
  const started = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = useCallback((fn: () => void, delay = 0) => {
    const t = setTimeout(() => {
      timers.current = timers.current.filter(x => x !== t);
      fn();
    }, delay);
    timers.current.push(t);
    return t;
  }, []);

  // Loading -------------------------------------------------------------------------------------
  const restore = (saved: any) => {
    setSession(saved.session);
    setLaunchScreen(saved.launchScreen ?? content.launchScreen(saved.session));
    setLocked(saved.locked ?? { myphone: false, herphone: true });
    setAppsData(saved.appsData ?? emptyAppsData());
    setNotifications(saved.notifications ?? { myphone: [], herphone: [] });
    setNotes(saved.notes ?? null);
    setHint(saved.hint ?? 0);
    setUsersOnline(saved.usersOnline ?? []);
    setGatherInfos(
      saved.gatherInfos !== undefined ? saved.gatherInfos : getCheckpoint(saved.session)?.gather?.infos ?? null,
    );
  };

  useEffect(() => {
    (async () => {
      setUser(await mockCloud.currentUser());
      const prefs = await retrieveItem<{ music: boolean; sounds: boolean }>('preferences', true);
      setMusicEnabled(prefs?.music ?? true);
      setSoundsEnabled(prefs?.sounds ?? true);
      const saved = await retrieveItem<any>('save', true);
      if (saved?.session) {
        restore(saved);
      } else {
        const initial = content.initialSession;
        setSession(initial);
        setLaunchScreen(content.launchScreen(initial));
        setLocked({ myphone: false, herphone: true });
        setGatherInfos(getCheckpoint(initial)?.gather?.infos ?? null);
      }
    })();
  }, []);

  useEffect(() => {
    if (musicEnabled === null || soundsEnabled === null) return;
    storeItem('preferences', { music: musicEnabled, sounds: soundsEnabled });
  }, [musicEnabled, soundsEnabled]);

  // Persist progress (debounced) ----------------------------------------------------------------
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveData = useCallback(() => {
    if (!sessionRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const snapshot = {
        session: sessionRef.current,
        launchScreen,
        locked,
        appsData,
        notifications,
        notes,
        hint,
        usersOnline,
        gatherInfos,
      };
      storeItem('save', snapshot);
      if (user && sessionRef.current) {
        mockCloud.save({
          session: sessionRef.current,
          percentage: progressPercentage(sessionRef.current),
          savedAt: nowStamp(),
          data: snapshot,
        });
      }
    }, 500);
  }, [launchScreen, locked, appsData, notifications, notes, hint, usersOnline, gatherInfos, user]);

  /** Restores a mirrored cloud save and returns where the game should open. */
  const loadCloudSave = useCallback(async (save: CloudSave) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    started.current = true;
    restore(save.data);
    sessionRef.current = save.session;
    await storeItem('save', save.data);
    return ((save.data as any).launchScreen ?? content.launchScreen(save.session)) as Screen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveData();
  }, [saveData, session]);

  // Current story event + in-game clock -----------------------------------------------------------
  useEffect(() => {
    if (!session) return;
    const objective = getObjective(session);
    const checkpoint = getCheckpoint(session);
    setEvent(objective ? { ...objective, ...checkpoint, title: objective.title, objectiveTitle: objective.title } : null);
    if (!objective) return;
    setDate(getDate(objective.date));
    let tick: ReturnType<typeof setTimeout> | null = null;
    const run = (from?: string) => {
      const t = getTime(from ?? objective.time ?? '09:41 PM');
      setTime(t.now);
      tick = setTimeout(() => run(t.later), t.diff);
    };
    run();
    return () => {
      if (tick) clearTimeout(tick);
    };
  }, [session]);

  // Play the notification chime whenever the shade gains non-call notifications.
  const notiCount = notifications.myphone.length + notifications.herphone.length;
  const prevNotiCount = useRef(notiCount);
  useEffect(() => {
    const grew = notiCount > prevNotiCount.current;
    prevNotiCount.current = notiCount;
    if (!grew || !soundsEnabled) return;
    const all = [...notifications.myphone, ...notifications.herphone];
    if (all.find(n => n.type === 'call')) return;
    playSound('notification.mp3');
  }, [notiCount, notifications, soundsEnabled]);

  // Notifications ---------------------------------------------------------------------------------
  const pushNotification = useCallback((device: PhoneName, notification: Notification, popup = true) => {
    setNotifications(prev => {
      const list = [...prev[device]];
      const index = list.findIndex(n => n.id === notification.id);
      if (index === -1) list.push(notification);
      else list[index] = { ...notification, badge: (list[index].badge ?? 1) + (notification.badge ?? 1) };
      return { ...prev, [device]: list };
    });
    if (popup) setPopupNotification({ myphone: null, herphone: null, [device]: notification });
    if (notification.autoHide) {
      later(() => setPopupNotification({ myphone: null, herphone: null }), notification.autoHide);
    }
  }, [later]);

  const clearNotifications = useCallback((device: PhoneName, predicate: (n: Notification) => boolean) => {
    setNotifications(prev => ({ ...prev, [device]: prev[device].filter(n => !predicate(n)) }));
  }, []);

  // Chat engine -----------------------------------------------------------------------------------
  const appendMessage = useCallback((device: PhoneName, chatName: string, message: ChatMessage) => {
    setAppsData(prev => {
      const list = prev[device].messages[chatName] ?? [];
      if (list.find(m => m.transformedId === message.transformedId)) return prev;
      return {
        ...prev,
        [device]: { ...prev[device], messages: { ...prev[device].messages, [chatName]: [...list, message] } },
      };
    });
  }, []);

  const triggerActionRef = useRef<(action: GameAction | null | undefined) => void>(() => {});

  const deliverNode = useCallback(
    (device: PhoneName, chatName: string, nodeId: string) => {
      const script = getConversation(device, chatName);
      const node: ChatNode | undefined = script?.[nodeId];
      if (!node) return;
      const key = chatKey(device, chatName);
      const fromPlayer = node.type === 1;
      const delay = node.delay ?? 1000;
      const sender = node.sender ?? chatName;

      if (!fromPlayer && node.text) {
        setChat(prev => ({ ...prev, typing: { ...prev.typing, [key]: sender } }));
      }
      later(() => {
        setChat(prev => ({ ...prev, typing: { ...prev.typing, [key]: null } }));
        if (node.text) {
          const message: ChatMessage = {
            id: nodeId,
            transformedId: `${sessionId(sessionRef.current)}-${nodeId}`,
            text: node.text,
            type: fromPlayer ? 1 : 0,
            sender: node.sender,
            time: nowStamp(),
            gather: node.gather,
          };
          appendMessage(device, chatName, message);
          const focused = chatFocused.current === key;
          if (focused) {
            if (soundsRef.current) playSound('message2.mp3');
          } else if (!fromPlayer) {
            setChat(prev => ({ ...prev, unread: { ...prev.unread, [key]: true } }));
            pushNotification(device, {
              id: `messages.${chatName}`,
              app: 'messages',
              screen: 'chat',
              chatName,
              title: contacts[chatName]?.name ?? chatName,
              subtitle: previewText(node),
              date: nowStamp(),
              badge: 1,
            });
          }
        }
        if (node.action) triggerActionRef.current(node.action);
        if (node.options && node.options.length) {
          setChat(prev => ({ ...prev, options: { ...prev.options, [key]: { nodeId, options: node.options! } } }));
          if (chatFocused.current !== key) setChat(prev => ({ ...prev, unread: { ...prev.unread, [key]: true } }));
        } else if (node.next) {
          deliverNode(device, chatName, node.next);
        }
      }, fromPlayer ? 0 : delay);
    },
    [appendMessage, later, pushNotification],
  );

  const chatRef = useRef(chat);
  chatRef.current = chat;

  const chooseOption = useCallback(
    (device: PhoneName, chatName: string, index: number) => {
      const key = chatKey(device, chatName);
      const pending = chatRef.current.options[key];
      if (!pending) return;
      const option = pending.options[index];
      setChat(prev => ({ ...prev, options: { ...prev.options, [key]: undefined } }));
      if (option.text) {
        appendMessage(device, chatName, {
          id: `${pending.nodeId}-${index}`,
          transformedId: `${sessionId(sessionRef.current)}-${pending.nodeId}-${index}`,
          text: option.text,
          type: 1,
          time: nowStamp(),
        });
        if (soundsRef.current) playSound('message2.mp3');
      }
      if (option.action) later(() => triggerActionRef.current(option.action));
      if (option.next) later(() => deliverNode(device, chatName, option.next!));
    },
    [appendMessage, deliverNode, later],
  );

  const setChatFocused = useCallback((device: PhoneName | null, chatName?: string | null) => {
    chatFocused.current = device && chatName ? chatKey(device, chatName) : null;
    if (device && chatName) {
      const key = chatKey(device, chatName);
      setChat(prev => ({ ...prev, unread: { ...prev.unread, [key]: false } }));
      clearNotifications(device, n => n.id === `messages.${chatName}`);
    }
  }, [clearNotifications]);

  // Calls -----------------------------------------------------------------------------------------
  const addCallRecord = useCallback((device: PhoneName, record: CallRecord) => {
    setAppsData(prev => ({ ...prev, [device]: { ...prev[device], call: [record, ...prev[device].call] } }));
  }, []);

  // Progression -----------------------------------------------------------------------------------
  const promote = useCallback((kind: 'checkpoint' | 'objective' | 'episode') => {
    const prev = sessionRef.current;
    if (!prev) return;
    const next = content.promote(prev, kind);
    if (!next) return;
    sessionRef.current = next;
    const checkpoint = getCheckpoint(next);
    if (checkpoint?.launch) setLaunchScreen(checkpoint.launch);
    setHint(0);
    setGatherInfos(checkpoint?.gather?.infos ?? null);
    setSession(next);
    if (checkpoint?.action) later(() => triggerActionRef.current(checkpoint.action), 0);
  }, [later]);

  // Clue gathering: the remaining clues live in `gatherInfos`; the toast carries
  // "<info index>_<progress>" exactly like the reference build.
  const gatherRef = useRef(gatherInfos);
  gatherRef.current = gatherInfos;
  const eventRef = useRef(event);
  eventRef.current = event;
  const handleGatherInfo = useCallback((id: string) => {
    const remainingNow = gatherRef.current;
    const gather = eventRef.current?.gather as { infos: GatherInfo[] } | undefined;
    if (!remainingNow || !gather) return;
    if (soundsRef.current) playSound('scribble.mp3');
    const index = gather.infos.findIndex(i => i.id === id);
    if (index === -1) return;
    const total = gather.infos.length;
    const progress = total > 1 ? `(${total - remainingNow.length + 1}/${total})` : '';
    const remaining = remainingNow.filter(i => i.id !== id);
    gatherRef.current = remaining;
    setGatherInfos(remaining);
    setToast(`${index}_${progress}`);
  }, []);

  // Action engine ---------------------------------------------------------------------------------
  const triggerAction = useCallback(
    (action: GameAction | null | undefined) => {
      if (!action) return;
      const delay = action.delay ?? 0;
      const chain = () => {
        if (action.action) triggerActionRef.current(action.action);
      };
      switch (action.app) {
        case 'messages':
          later(() => {
            if (action.device && action.chatName && action.id) deliverNode(action.device, action.chatName, action.id);
            chain();
          }, delay);
          break;
        case 'notification':
          later(() => {
            if (action.device && action.notification) pushNotification(action.device, action.notification);
            chain();
          }, delay);
          break;
        case 'call':
          later(() => {
            if (action.device && action.caller) {
              pushNotification(action.device, {
                type: 'call',
                id: `call.${action.caller}`,
                app: 'call',
                title: contacts[action.caller]?.name ?? action.caller,
                subtitle: 'Incoming call...',
                caller: action.caller,
                date: nowStamp(),
                badge: 1,
                retry: action.retry,
              });
            }
            chain();
          }, delay);
          break;
        case 'highlight':
          later(() => {
            if (action.object) setHighlightInSuspectBoard(action.object);
            if (action.noti) {
              pushNotification('myphone', {
                id: `suspectboard.${action.object}`,
                app: 'suspectboard',
                title: action.noti,
                subtitle: 'click_to_view',
                date: nowStamp(),
                badge: 1,
              });
            }
            chain();
          }, delay);
          break;
        case 'forceNavigate':
          later(() => {
            if (action.forceNavigate) setForceNavigation(action.forceNavigate);
            chain();
          }, delay);
          break;
        case 'online':
          later(() => {
            setUsersOnline(prev => [...new Set([...prev, ...(action.users ?? [])])]);
            chain();
          }, delay);
          break;
        case 'offline':
          later(() => {
            setUsersOnline(prev => prev.filter(u => !(action.users ?? []).includes(u)));
            chain();
          }, delay);
          break;
        case 'playsound':
          later(() => {
            if (soundsRef.current && action.name) {
              const id = action.name;
              createSound(action.name, s => {
                if (s === 'error') return;
                s.setVolume(action.volume ?? 0.5);
                if (action.loops) s.setNumberOfLoops(action.loops);
                loopingSounds.current.push({ id, audio: s });
                s.play(() => {
                  s.release();
                  loopingSounds.current = loopingSounds.current.filter(x => x.audio !== s);
                });
              });
            }
            chain();
          }, delay);
          break;
        case 'stopsound':
          later(() => {
            loopingSounds.current
              .filter(x => x.id === action.name)
              .forEach(x => x.audio.stop(() => x.audio.release()));
            loopingSounds.current = loopingSounds.current.filter(x => x.id !== action.name);
            chain();
          }, delay);
          break;
        case 'unlock':
          later(() => {
            if (action.device) setLocked(prev => ({ ...(prev ?? { myphone: false, herphone: true }), [action.device!]: false }));
            chain();
          }, delay);
          break;
        case 'battery':
          later(() => {
            if (action.level) setBatteryIcon(action.level);
            chain();
          }, delay);
          break;
        case 'objective':
        case 'checkpoint':
        case 'episode':
          later(() => {
            promote(action.app as 'objective' | 'checkpoint' | 'episode');
            chain();
          }, delay);
          break;
        default:
          chain();
      }
    },
    [deliverNode, later, pushNotification, promote],
  );
  triggerActionRef.current = triggerAction;

  // Every clue gathered: run the gather action (usually a promotion).
  useEffect(() => {
    if (!gatherInfos || !event?.gather) return;
    if (gatherInfos.length <= 0) {
      triggerAction(event.gather.action);
      setGatherInfos(null);
    }
  }, [gatherInfos, event, triggerAction]);

  // Kick off the current checkpoint once on load.
  useEffect(() => {
    if (!session || started.current) return;
    started.current = true;
    const checkpoint = getCheckpoint(session);
    const alreadyPlayed = Object.values(appsData.myphone.messages).length + Object.values(appsData.herphone.messages).length > 0;
    if (checkpoint?.action && !alreadyPlayed) triggerAction(checkpoint.action);
  }, [session, appsData, triggerAction]);

  // Hints ("rewarded" immediately; there are no ads in this build).
  const showAd = useCallback(() => {
    later(() => setHint(h => h + 1), 600);
  }, [later]);

  // Subtitles ---------------------------------------------------------------------------------------
  const subtitleTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stopSubtitles = useCallback(() => {
    subtitleTimers.current.forEach(clearTimeout);
    subtitleTimers.current = [];
    setSubtitle(null);
  }, []);
  const playSubtitles = useCallback((lines: { text: string; duration: number }[]) => {
    stopSubtitles();
    let at = 0;
    lines.forEach(line => {
      subtitleTimers.current.push(setTimeout(() => setSubtitle({ text: line.text }), at));
      at += line.duration;
    });
    subtitleTimers.current.push(setTimeout(() => setSubtitle(null), at));
  }, [stopSubtitles]);

  const resetProgress = useCallback(async () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    await deleteItem('save');
    const initial = content.initialSession;
    started.current = false;
    setAppsData(emptyAppsData());
    setNotifications({ myphone: [], herphone: [] });
    setPopupNotification({ myphone: null, herphone: null });
    setChat({ typing: {}, options: {}, unread: {} });
    setUsersOnline([]);
    setHint(0);
    setGatherInfos(null);
    setNotes(null);
    setLocked({ myphone: false, herphone: true });
    setLaunchScreen(content.launchScreen(initial));
    setSession({ ...initial });
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return {
    // settings
    musicEnabled, setMusicEnabled, soundsEnabled, setSoundsEnabled,
    // progress
    session, setSession, launchScreen, setLaunchScreen, locked, setLocked, appsData, setAppsData,
    currentAppsData: appsData, setCurrentAppsData: setAppsData,
    notes, setNotes, hint, setHint, recoveredApps, setRecoveredApps, user, setUser,
    // sidetrails are not part of this build's mock content
    sidetrailsSession: null as any, sidetrailsMode: false, setSidetrailsMode: (_: boolean) => {},
    sidetrailsEvent: null as any,
    // live state
    event, setEvent, time, date, notifications, setNotifications, popupNotification, setPopupNotification,
    appState, setAppState, gameVisible, setGameVisible, gatherInfos, setGatherInfos, handleGatherInfo,
    usersOnline, setUsersOnline, toast, setToast, highlightInSuspectBoard, setHighlightInSuspectBoard,
    BGColor, setBGColor, swipeEnabled, setSwipeEnabled, infoOnScreen, setInfoOnScreen,
    forceNavigation, setForceNavigation, batteryIcon, setBatteryIcon, flashback, setFlashback, ping, setPing,
    subtitle, setSubtitle, playSubtitles, stopSubtitles, fade, setFade, timeTravel: null as any,
    // engine
    triggerAction, promote, showAd, saveData, resetProgress, loadCloudSave,
    chat, chooseOption, setChatFocused, pushNotification, clearNotifications, addCallRecord,
  };
}

function sessionId(session: Session | null) {
  return session ? `E${session.episode}O${session.objective}C${session.checkpoint}` : 'E0';
}

function previewText(node: ChatNode) {
  const text = node.text ?? '';
  if (text.startsWith('image::')) return '[image]';
  if (text.startsWith('audio::')) return '[audio]';
  return text;
}

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const value = useGlobalState();
  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}
