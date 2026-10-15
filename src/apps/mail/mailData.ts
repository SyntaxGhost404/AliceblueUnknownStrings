import moment from 'moment';
import { isActiveInSession } from '../../content';
import { Mail, mails, mailSenders } from '../../content/mock/mail';
import { Session } from '../../content/types';
import { DATE_DISPLAY_FORMAT, TIME_FORMAT } from '../../utils/date';

/** Per-app persisted state (`appsData[phone].apps.mail`). */
export type MailState = {
  /** Ids of the mails the player has opened. */
  read?: string[];
  /** Ids a story action put in the inbox regardless of time and story window. */
  delivered?: string[];
};

/**
 * What is in the inbox now: delivered mails, plus mails whose release time the in-game clock has
 * passed and whose story window (`start`..`end`) contains the current story point.
 */
export function getInbox(session: Session | null, date: string, time: string, delivered: string[] = []): Mail[] {
  const now = moment.utc(`${date} ${time}`, `${DATE_DISPLAY_FORMAT} ${TIME_FORMAT}`);
  return mails.filter(mail => {
    if (delivered.includes(mail.id)) return true;
    if (mail.deliveredOnly) return false;
    return moment.utc(mail.time).isBefore(now) && isActiveInSession(session, mail.start, mail.end);
  });
}

/** A mail from a route param: a mail object or just its id (notifications carry the id). */
export function resolveMail(param: unknown): Mail | undefined {
  if (!param) return undefined;
  const id = typeof param === 'string' ? param : (param as Mail).id;
  const base = mails.find(m => m.id === id);
  return typeof param === 'object' && base ? { ...base, ...(param as Mail) } : base;
}

/** New mails (ones the story brings in later) carry a red dot until they are opened. */
export const isNewMail = (mail: Mail, delivered: string[] = []) => !!mail.start || delivered.includes(mail.id);

export const getSender = (mail: Mail) => mailSenders[mail.from] ?? { name: mail.from, email: '' };
