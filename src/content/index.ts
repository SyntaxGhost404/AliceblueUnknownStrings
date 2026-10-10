import episodes from './mock/story';
import { conversations, fillerchats, profiles } from './mock/chats';
import contacts from './mock/contacts';
import { calls } from './mock/calls';
import { CallScript, ChatScript, Checkpoint, Objective, PhoneName, Screen, Session } from './types';

export type AppConfig = {
  name: string;
  screens?: string[];
  /** [episode, objective, checkpoint] from which the app shows on the home screen. */
  start?: [number, number, number];
  /** Hidden from the home screen (launched by the story only). */
  notOnHome?: boolean;
};

// Same app roster and order as the reference build.
export const phones: Record<PhoneName, { screens: string[]; apps: Record<string, AppConfig> }> = {
  myphone: {
    screens: ['lockscreen', 'homescreen'],
    apps: {
      messages: { name: 'Messages', screens: ['home', 'chat'] },
      call: { name: 'Phone' },
      calculator: { name: 'Calculator' },
      browser: { name: 'Browser' },
      notes: { name: 'Notes' },
      archive: { name: 'Archive' },
      sidetrails: { name: 'Sidetrails' },
      settings: { name: 'Settings' },
    },
  },
  herphone: {
    screens: ['lockscreen', 'homescreen'],
    apps: {
      messages: { name: 'Messages' },
      call: { name: 'Phone' },
      mail: { name: 'Mail' },
      gallery: { name: 'Gallery' },
      pixabowl: { name: 'Pixabowl' },
      diary: { name: 'Diary' },
      files: { name: 'Files' },
      symmetry: { name: 'Symmetry' },
      settings: { name: 'Settings' },
      recovery: { name: 'Recovery', notOnHome: true },
      safemode: { name: 'Safemode', notOnHome: true },
    },
  },
};

const initialSession: Session = { episode: 0, objective: 0, checkpoint: 0 };

export function getObjective(session: Session): Objective | undefined {
  return episodes[session.episode]?.objectives[session.objective];
}

export function getCheckpoint(session: Session): Checkpoint | undefined {
  return getObjective(session)?.checkpoints[session.checkpoint];
}

export function getEpisode(index: number) {
  return episodes[index];
}

export function episodeCount() {
  return episodes.length;
}

/** Story event for the current session, shaped like the reference build's events. */
export function getMainStoryEvent(session: Session | null, includeObjective = false) {
  if (!session) return null;
  const objective = getObjective(session);
  const checkpoint = getCheckpoint(session);
  if (!objective) return null;
  return {
    ...(includeObjective ? objective : {}),
    ...checkpoint,
    title: objective.title,
    hints: objective.hints,
    gather: checkpoint?.gather,
    objectiveHidden: checkpoint?.objectiveHidden,
  };
}

function promote(session: Session, kind: 'checkpoint' | 'objective' | 'episode'): Session | null {
  const episode = episodes[session.episode];
  if (!episode) return null;
  if (kind === 'checkpoint') {
    const objective = episode.objectives[session.objective];
    if (objective && session.checkpoint + 1 < objective.checkpoints.length) {
      return { ...session, checkpoint: session.checkpoint + 1 };
    }
    return promote(session, 'objective');
  }
  if (kind === 'objective') {
    if (session.objective + 1 < episode.objectives.length) {
      return { ...session, objective: session.objective + 1, checkpoint: 0 };
    }
    return promote(session, 'episode');
  }
  if (session.episode + 1 < episodes.length) {
    return { episode: session.episode + 1, objective: 0, checkpoint: 0 };
  }
  return null;
}

function launchScreen(session: Session): Screen {
  return getCheckpoint(session)?.launch ?? episodes[session.episode]?.launch ?? 'myphone';
}

export function getConversation(phone: PhoneName, chatName: string): ChatScript | undefined {
  return conversations[phone]?.[chatName];
}

export function getFillerChat(phone: PhoneName, chatName: string) {
  return fillerchats[phone]?.[chatName] ?? [];
}

export function getChatNames(phone: PhoneName) {
  return [...new Set([...Object.keys(fillerchats[phone] ?? {}), ...Object.keys(conversations[phone] ?? {})])];
}

export function getProfileStatus(chatName: string) {
  return profiles[chatName]?.status ?? '';
}

export function getProfileName(chatName: string | undefined) {
  if (!chatName) return '';
  return contacts[chatName]?.name ?? chatName;
}

/** Call script for a contact at the current story position (most specific match wins). */
export function getCallScript(phone: PhoneName, contact: string | undefined, session: Session): CallScript | null {
  if (!contact) return null;
  const scripts = calls[phone]?.[contact];
  if (!scripts) return null;
  const { episode: e, objective: o, checkpoint: c } = session;
  return scripts[`e${e}o${o}c${c}`] ?? scripts[`e${e}o${o}`] ?? scripts.generic ?? null;
}

/** Passcodes for locked phones (mock content). */
export const passcodes: Partial<Record<PhoneName, string>> = { herphone: '12345' };

/** Share of all checkpoints completed, as shown on saved-progress prompts. */
export function progressPercentage(session: Session) {
  let total = 0;
  let done = 0;
  episodes.forEach((episode, e) =>
    episode.objectives.forEach((objective, o) =>
      objective.checkpoints.forEach((_, c) => {
        total += 1;
        const before =
          e < session.episode ||
          (e === session.episode && (o < session.objective || (o === session.objective && c < session.checkpoint)));
        if (before) done += 1;
      }),
    ),
  );
  return total ? Math.round((done / total) * 100) : 0;
}

/** Whether the background score plays at this point of the story. */
export function isMusicOn(session: Session) {
  const music = episodes[session.episode]?.music;
  if (music === undefined || typeof music === 'boolean') return music ?? true;
  return session.objective >= music.fromObjective;
}

export function isAppVisible(app: AppConfig, session: Session | null) {
  if (app.notOnHome) return false;
  if (!app.start || !session) return true;
  const [e, o, c] = app.start;
  if (session.episode !== e) return session.episode > e;
  if (session.objective !== o) return session.objective > o;
  return session.checkpoint >= c;
}

export default { initialSession, launchScreen, promote };
