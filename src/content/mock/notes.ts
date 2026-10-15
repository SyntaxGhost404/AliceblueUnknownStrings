import { GameAction } from '../types';

// MOCK DATA — notes for the Notes app. Replace the placeholder texts with real content later.

export type NoteData = { id: string; text: string };

/** Notes present on a fresh save (the first one is the app's own welcome note). */
export const initialNotes: NoteData[] = [
  { id: 'welcome', text: 'Use this app to jot down your thoughts, clues, or anything else you want to remember.' },
  { id: 'placeholder-1', text: '[Placeholder] A short note.' },
  { id: 'placeholder-2', text: '[Placeholder] A longer note that spreads over a few lines so that the two-column grid has uneven cards.' },
];

/**
 * A note that "types itself" line by line, character by character (45 ms per character), once the
 * note screen opens. `delays[i]` is the pause (ms) before line `i` starts; `action` runs when the
 * last line is done. Open one with a force-navigation (see ForceNavigation in content/types.ts):
 *   { screen: 'myphone', app: 'notes', appScreen: 'note',
 *     data: { data: { id: 'unique-id', text: '' }, isNew: true, script: 'placeholder' } }
 */
export type NoteScript = { lines: string[]; delays: number[]; action?: GameAction };

export const noteScripts: Record<string, NoteScript> = {
  placeholder: {
    lines: [
      '[Placeholder] Scripted note, first line.',
      'Second line.',
      'Third line.',
      'Fourth line.',
      'Fifth line.',
      'Sixth line.',
      'Seventh line.',
      '[Placeholder] Signature',
    ],
    delays: [1500, 1000, 700, 1200, 1200, 1200, 1200, 1200],
  },
};

export const newNoteId = () => Math.random().toString(36).slice(2);
