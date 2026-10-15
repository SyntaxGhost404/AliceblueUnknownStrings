// MOCK DATA — the Archive app: characters, relation labels, recaps and the home cards.
// Every `start` is a [episode, objective, checkpoint] window opening at that point of the story
// (see isActiveInSession). Names and texts are placeholders; portraits borrow existing images.

type Start = [number, number, number];

/** Home-screen cards of the Archive app, in display order (hidden until their `start`). */
export const archiveCards: { id: 'tasks' | 'characters' | 'timeline' | 'recaps'; title: string; start?: Start }[] = [
  { id: 'tasks', title: 'Tasks' },
  { id: 'characters', title: 'Characters' },
  { id: 'timeline', title: 'Timeline', start: [1, 1, 1] },
  { id: 'recaps', title: 'Recaps', start: [1, 1, 0] },
];

export type CharacterBlock = { content: string; start: Start };

export type ArchiveCharacter = {
  id: string;
  /** Full name; the grid shows the first word (or everything for "Dr." names). */
  name: string;
  /** Key of the image in src/assets/characters used as this character's portrait. */
  portrait: string;
  /** `name` is a key of `relationLabels`; `person` is a character id, 'me' (the player) or ''. */
  relation: { name: string; person: string };
  /** Facts about the character; the first block's `start` is when the character unlocks. */
  blocks: CharacterBlock[];
};

/** Display names for relation keys. */
export const relationLabels: Record<string, string> = {
  friend: 'Friend',
  colleague: 'Colleague',
  family: 'Family member',
  neighbor: 'Neighbor',
  schoolmate: 'Schoolmate',
  acquaintance: 'Acquaintance',
  unknown: '',
};

const block = (content: string, start: Start): CharacterBlock => ({ content, start });

export const characters: ArchiveCharacter[] = [
  {
    id: 'alpha',
    name: 'Alpha Example',
    portrait: 'unknown',
    relation: { name: 'unknown', person: '' },
    blocks: [block('[Placeholder] First fact about Alpha.', [0, 0, 0]), block('[Placeholder] Second fact about Alpha.', [1, 1, 0])],
  },
  {
    id: 'bravo',
    name: 'Bravo Example',
    portrait: 'colleague',
    relation: { name: 'colleague', person: 'me' },
    blocks: [block('[Placeholder] First fact about Bravo.', [0, 0, 0])],
  },
  {
    id: 'charlie',
    name: 'Charlie Example',
    portrait: 'zoey',
    relation: { name: 'family', person: 'bravo' },
    blocks: [
      block('[Placeholder] First fact about Charlie.', [0, 1, 0]),
      block('[Placeholder] Second fact about Charlie.', [1, 0, 0]),
      block('[Placeholder] Third fact about Charlie.', [1, 1, 1]),
    ],
  },
  {
    id: 'delta',
    name: 'Delta Example',
    portrait: 'lily',
    relation: { name: 'friend', person: 'charlie' },
    blocks: [block('[Placeholder] First fact about Delta.', [0, 1, 0])],
  },
  {
    id: 'echo',
    name: 'Echo Example',
    portrait: 'betty',
    relation: { name: 'friend', person: 'charlie' },
    blocks: [block('[Placeholder] First fact about Echo.', [1, 0, 0]), block('[Placeholder] Second fact about Echo.', [1, 1, 0])],
  },
  {
    id: 'foxtrot',
    name: 'Foxtrot Example',
    portrait: 'kyle',
    relation: { name: 'schoolmate', person: 'charlie' },
    blocks: [block('[Placeholder] First fact about Foxtrot.', [1, 0, 0])],
  },
  {
    id: 'golf',
    name: 'Golf Example',
    portrait: 'mike',
    relation: { name: 'neighbor', person: 'me' },
    blocks: [block('[Placeholder] First fact about Golf.', [1, 0, 0])],
  },
  {
    id: 'hotel',
    name: 'Hotel Example',
    portrait: 'zoeysmom',
    relation: { name: 'family', person: 'charlie' },
    blocks: [block('[Placeholder] First fact about Hotel.', [1, 1, 0])],
  },
  {
    id: 'india',
    name: 'India Example',
    portrait: 'zoeysdad',
    relation: { name: 'family', person: 'charlie' },
    blocks: [block('[Placeholder] First fact about India.', [1, 1, 0])],
  },
  {
    id: 'juliet',
    name: 'Dr. Juliet Example',
    portrait: 'counselor',
    relation: { name: 'acquaintance', person: 'me' },
    blocks: [block('[Placeholder] First fact about Dr. Juliet.', [1, 1, 0])],
  },
  {
    id: 'kilo',
    name: 'Kilo Example',
    portrait: 'kevin',
    relation: { name: 'friend', person: 'charlie' },
    blocks: [block('[Placeholder] First fact about Kilo.', [1, 1, 1])],
  },
  {
    id: 'lima',
    name: 'Lima Example',
    portrait: 'brad',
    relation: { name: 'schoolmate', person: 'kilo' },
    blocks: [block('[Placeholder] First fact about Lima.', [1, 1, 1])],
  },
];

export type ArchiveRecap = { summary: string; video?: string; start: Start };

/** One recap per episode, starting with episode 1; each opens at the end of its episode. */
export const recaps: ArchiveRecap[] = [
  {
    summary:
      '[Placeholder] Summary of the first episode. The first paragraph sets the scene.\n\n[Placeholder] The second paragraph covers what happened next.',
    video: 'https://example.com/placeholder-recap',
    start: [1, 1, 0],
  },
  { summary: '[Placeholder] Summary of the second episode.', start: [2, 0, 0] },
];
