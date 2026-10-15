import { getAppString } from '../appStrings';

// MOCK DATA — placeholder diary. Every page is a narrated entry (lines revealed in step
// with the audio) guarded by a letter-wheel riddle. Real entries, riddles and recordings
// replace these later; the shapes below are what the Diary app consumes.

export type DiaryLine = { text: string; startTime: string };

export type DiaryPageData = {
  /** Narration lines; `startTime` is `hh:mm:ss.mmm` into the recording. `^..^` marks emphasis. */
  content: DiaryLine[];
  /** Recording in the sound resources. Missing files fall back to a timed read-through. */
  audio: string;
  /** `MMM Do, YYYY`. */
  date: string;
  /** Optional picture shown under the text. */
  image?: { name: string; width: string; aspectRatio: number };
  riddle: string;
  /** Lower-case letters (spaces allowed). */
  answer: string;
  /** `[episode, objective, checkpoint]` at which the page becomes available. */
  start: [number, number, number];
};

const lines = (rows: [string, string][]): DiaryLine[] => rows.map(([text, startTime]) => ({ text, startTime }));

const sample = (title: string): DiaryLine[] =>
  lines([
    [`[Placeholder] ${title}.`, '00:00:00.060'],
    ['This is sample text that appears', '00:00:01.270'],
    ['line by line while the entry', '00:00:02.460'],
    ['is being read out loud.', '00:00:03.660'],
    ['Some words are ^highlighted by', '00:00:05.110'],
    ['the narrator^ to draw attention.', '00:00:06.170'],
    ['A new paragraph starts here and', '00:00:08.340'],
    ['carries on for a couple of lines', '00:00:09.460'],
    ['so the layout can be checked', '00:00:10.860'],
    ['on narrow and wide screens.', '00:00:11.960'],
    ['The end of the entry.', '00:00:13.920'],
  ]);

const page = (n: number, extra: Partial<DiaryPageData> & Pick<DiaryPageData, 'date' | 'answer' | 'start'>): DiaryPageData => ({
  content: sample(`Entry ${n}`),
  audio: `diarypage${n}.mp3`,
  riddle: `[Placeholder] Riddle ${n}.\nTurn the wheels until they spell\n"${extra.answer}".`,
  ...extra,
});

const pages: DiaryPageData[] = [
  page(1, { date: 'Jan 2nd, 2023', answer: 'moon', start: [1, 0, 0], image: { name: 'arrows', width: '60%', aspectRatio: 8.35 } }),
  page(2, { date: 'Jan 9th, 2023', answer: 'sun rise', start: [1, 0, 0], image: { name: 'symbolenvelope', width: '42%', aspectRatio: 2.79 } }),
  page(3, { date: 'Jan 16th, 2023', answer: 'river', start: [1, 1, 0] }),
  page(4, { date: 'Jan 23rd, 2023', answer: 'cloud', start: [2, 0, 0] }),
  page(5, { date: 'Jan 30th, 2023', answer: 'stone', start: [2, 1, 0] }),
  page(6, { date: 'Feb 6th, 2023', answer: 'maple', start: [2, 2, 0], image: { name: 'emojipassword', width: '28%', aspectRatio: 3.737 } }),
  page(7, { date: 'Feb 13th, 2023', answer: 'ember', start: [2, 3, 0] }),
  page(8, { date: 'Feb 20th, 2023', answer: 'brave', start: [2, 4, 0] }),
  page(9, { date: 'Feb 27th, 2023', answer: 'lily', start: [3, 0, 0] }),
  page(10, { date: 'Mar 6th, 2023', answer: 'piano', start: [3, 1, 0] }),
  page(11, { date: 'Mar 13th, 2023', answer: 'quilt', start: [3, 2, 0] }),
  page(12, { date: 'Mar 20th, 2023', answer: 'trust', start: [3, 3, 0] }),
];

/** The diary: intro line plus its twelve pages. */
export function getDiary() {
  return { intro: getAppString('herphone', 'diary', 'intro_text'), pages };
}

export default pages;
