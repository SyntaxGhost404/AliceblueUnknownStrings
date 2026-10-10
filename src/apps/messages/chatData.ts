import moment from 'moment';
import { ChatMessage } from '../../state/GlobalProvider';
import { getFillerChat, getObjective, getProfileName } from '../../content';
import { getAppString } from '../../content/appStrings';
import { PhoneName, Session } from '../../content/types';

const str = (key: string) => getAppString('myphone', 'messages', key);

/** Older history shown above the live conversation. */
export function getHistory(phone: PhoneName, chatName: string): ChatMessage[] {
  return getFillerChat(phone, chatName).map((m, index) => ({
    id: `filler-${index}`,
    transformedId: `F-${chatName}-${index}`,
    text: m.text,
    type: Number(m.type),
    sender: m.sender,
    time: m.time,
  }));
}

/** Absolute moment of a message: history carries ISO stamps, live messages the game clock. */
export function messageMoment(message: ChatMessage, session: Session | null) {
  const strict = moment(message.time, ['hh:mm A', 'h:mm A'], true);
  if (strict.isValid() && session) {
    const date = getObjective(session)?.date;
    return moment(`${date} ${message.time}`, 'DD-MM-YYYY hh:mm A');
  }
  return moment(message.time);
}

/** "h:mm A" label used under bubbles. */
export function formatMessageTime(time: string) {
  const strict = moment(time, ['hh:mm A', 'h:mm A'], true);
  return strict.isValid() ? strict.format('h:mm A') : moment(time).format('h:mm A');
}

/** Text for a `system::` line. */
export function systemText(token: string, session: Session | null) {
  if (token.startsWith('messages_deleted')) return str('messages_deleted').replace('576', token.split('_')[2]);
  if (token.startsWith('chatting_with')) return str('chatting_with').replace('Person', getProfileName(token.split('_')[2]));
  if (token === 'messages_failed_load') return str('messages_failed_load');
  if (session && /\d{4}$/.test(token)) {
    const day = moment(token, 'Do MMMM, YYYY');
    const today = moment(getObjective(session)?.date, 'DD-MM-YYYY');
    if (day.isValid() && day.isSame(today, 'date')) return 'Today';
  }
  return token;
}

/** One-line preview for the chat list. */
export function previewText(message: ChatMessage | undefined, session: Session | null) {
  if (!message) return '';
  const text = message.text;
  if (!text.includes('::')) return text;
  const [kind, value] = text.split('::');
  if (kind === 'system') return systemText(value, session);
  const who = message.type === 1 ? str('you') : getProfileName(message.sender);
  switch (kind) {
    case 'image':
      return str('sent_image').replace('Person', who);
    case 'audio':
      return str('sent_audio').replace('Person', who);
    case 'contact':
      return '👤 ' + getProfileName(value.trim().toLowerCase());
    case 'url':
    case 'file':
      return str('sent_file').replace('Person', who);
    default:
      return value ?? text;
  }
}

/** Status line under the chat: typing, online/offline, or who in a group is online. */
export function typingStatus(name: string) {
  return str('typing_one').replace('Person', `*${name}*`);
}

export function presenceStatus(name: string, online: boolean) {
  return str(online ? 'online_one' : 'offline_one').replace('Person', `*${name}*`);
}

export function groupPresence(names: string[]) {
  const marked = names.map(n => `*${n}*`);
  if (marked.length === 0) return str('online_none');
  if (marked.length === 1) return str('online_one').replace('Person', marked[0]);
  if (marked.length === 2) return str('online_two').replace('Person1', marked[0]).replace('Person2', marked[1]);
  return str('online_multiple')
    .replace('Person1', marked[0])
    .replace('Person2', marked[1])
    .replace('Person3', marked.slice(2).join(', '));
}
