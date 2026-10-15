import { isActiveInSession } from '../../content';
import { ArchiveCharacter, characters, relationLabels } from '../../content/mock/archive';
import { Session } from '../../content/types';

/** Name shown on a character tile: the first word, or the whole name for "Dr." titles. */
export const shortName = (name: string) => (name.startsWith('Dr.') ? name : name.split(' ')[0]);

/** Characters whose first fact has been unlocked by the story so far. */
export const getUnlockedCharacters = (session: Session | null) =>
  characters.filter(character => isActiveInSession(session, character.blocks[0].start));

export type SortMethod = 'alphabetical' | 'date';
export type SortOrder = 'az' | 'za' | 'oldToNew' | 'newToOld';

/** Unlock order key of a character: its first fact's [episode, objective]. */
const unlockKey = (character: ArchiveCharacter) => {
  const start = character.blocks[0]?.start ?? [0, 0, 0];
  return start[0] * 1000 + start[1];
};

/** Sorted copy of the list by name (A-Z / Z-A) or by unlock point (names break ties, A-Z). */
export function sortCharacters(list: ArchiveCharacter[], method: SortMethod, order: SortOrder) {
  const sorted = [...list];
  if (method === 'alphabetical') {
    return sorted.sort((a, b) => (order === 'za' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)));
  }
  return sorted.sort((a, b) => {
    const diff = order === 'newToOld' ? unlockKey(b) - unlockKey(a) : unlockKey(a) - unlockKey(b);
    return diff || a.name.localeCompare(b.name);
  });
}

/** "My friend", "Charlie's friend" or just "Friend", from a character's relation. */
export function getRelation(relation?: ArchiveCharacter['relation']) {
  const label = relation ? relationLabels[relation.name] : '';
  if (!label || !relation) return '';
  let prefix = '';
  if (relation.person === 'me') prefix = 'My ';
  else if (relation.person) {
    const owner = characters.find(character => character.id === relation.person);
    if (owner) prefix = shortName(owner.name) + "'s ";
  }
  return prefix + (prefix ? label.toLowerCase() : label);
}
