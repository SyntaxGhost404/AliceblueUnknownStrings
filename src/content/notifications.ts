import { getProfileName } from './index';
import { getGeneral } from './general';

const keyed = (key: string) => getGeneral('notifications', key);

/** Expands the notification string tokens used by story data into display text. */
export function translateNotificationText(text: string | undefined): string {
  if (!text) return '';
  if (text === '[audio]') return `(${keyed('audio')})`;
  if (text === '[image]') return `(${keyed('image')})`;
  if (text.startsWith('sender_')) return getProfileName(text.split('_')[1]);
  if (text.includes('missed_calls')) return `${text.split('_')[2]} ${keyed('missed_calls')}`;
  if (text.includes('diary_page')) return keyed('diary_title').replace('1', text.split('_')[2]);
  if (text.startsWith('chatName_')) {
    const parts = text.split('_');
    return `${getProfileName(parts[1])}: ${translateNotificationText(parts.slice(2).join('_'))}`;
  }
  if (text.startsWith('character_')) return getProfileName(text.split('_')[1]);
  const translated = getGeneral('notifications', text);
  return translated;
}

