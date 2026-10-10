// Content schema shared by the engine and the UI. It mirrors the reference build's data
// model so real story content can later replace the placeholder data in src/content/mock.

export type PhoneName = 'myphone' | 'herphone';
export type Screen = PhoneName | 'suspectboard';

export type Session = { episode: number; objective: number; checkpoint: number };

export type Contact = {
  name: string;
  number: string;
  /** Hides the number in call/profile screens. */
  private?: boolean;
  group?: { members: string[] };
};

/**
 * A node of a chat script. `text` may carry a typed payload:
 * `image::<key>`, `audio::<file>`, `contact::<id>`, `url::<site>`, `file::<name>` or `system::<token>`.
 */
export type ChatNode = {
  text: string | null;
  /** 0 = contact (left bubble), 1 = player (right bubble). Defaults to 0. */
  type?: 0 | 1;
  /** Group chats: which member sent it. */
  sender?: string;
  /** Typing time before the message appears (ms). */
  delay?: number;
  options?: ChatOption[];
  next?: string | null;
  /** Engine action fired once the message is delivered. */
  action?: GameAction | null;
  /** Marks a clue the player can tap to collect for the current objective. */
  gather?: string;
};

export type ChatOption = { text: string | null; next: string | null; action?: GameAction | null };

export type ChatScript = Record<string, ChatNode>;

export type Notification = {
  id: string;
  app: string;
  type?: 'call';
  screen?: string;
  chatName?: string;
  caller?: string;
  title?: string;
  subtitle?: string;
  date?: string;
  badge?: number;
  retry?: boolean;
  autoHide?: number;
  url?: string;
  email?: string;
  data?: any;
  action?: GameAction;
};

/** Engine instruction (the reference build calls these "actions"). */
export type GameAction = {
  app:
    | 'messages'
    | 'notification'
    | 'call'
    | 'mail'
    | 'highlight'
    | 'forceNavigate'
    | 'online'
    | 'offline'
    | 'playsound'
    | 'stopsound'
    | 'objective'
    | 'checkpoint'
    | 'episode'
    | 'unlock'
    | 'battery';
  device?: PhoneName;
  delay?: number;
  chatName?: string;
  id?: string;
  caller?: string;
  retry?: boolean;
  notification?: Notification;
  users?: string[];
  name?: string;
  volume?: number;
  loops?: number;
  object?: string;
  screen?: Screen;
  noti?: string;
  forceNavigate?: ForceNavigation;
  text?: string;
  level?: 'low' | 'medium' | 'full' | 'charging';
  action?: GameAction | null;
};

export type ForceNavigation = {
  screen: Screen;
  app?: string;
  appScreen?: string;
  data?: Record<string, unknown>;
  noHomescreen?: boolean;
  delay?: number;
};

export type GatherInfo = { id: string; text: string };

export type Checkpoint = {
  title?: string;
  launch?: Screen;
  objectiveHidden?: boolean;
  /** Show the "swipe between screens" coach mark on Zoey's home screen. */
  swipeHelp?: boolean;
  action?: GameAction | null;
  /** Clues to collect; `action` runs once all of them are gathered. */
  gather?: { infos: GatherInfo[]; action?: GameAction | null };
};

export type Objective = {
  title: string;
  description?: string;
  /** Story date, DD-MM-YYYY. The in-game clock starts here. */
  date: string;
  /** Story time, hh:mm A. */
  time?: string;
  hints?: string[];
  checkpoints: Checkpoint[];
};

export type Episode = {
  title: string;
  launch?: Screen;
  /** Background score: on/off for the whole episode, or on from a given objective. */
  music?: boolean | { fromObjective: number };
  objectives: Objective[];
};

/** A spoken line during a call, captioned for `duration` ms. `speaker` defaults to the caller. */
export type CallLine = { text: string; duration: number; speaker?: string };

/** Scripted phone conversation for one contact at a point of the story. */
export type CallScript = {
  /** Ring time before the contact picks up an outgoing call (ms). */
  delay?: number;
  /** Don't add the outgoing call to the call log. */
  dontSave?: boolean;
  lines: CallLine[];
  /** Player replies offered once the lines finish (8 s to choose, like the original). */
  options?: { text: string; lines: CallLine[]; action?: GameAction | null }[];
  /** Fired once the call connects. */
  action?: GameAction | null;
};
