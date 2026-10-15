import assets from '../../assets';

// MOCK DATA — placeholder files for Zoey's Files app. Posters come from assets.files, the
// clips are stand-ins from assets.videos and the voice note plays an ambience from the sound
// resources. Real files (and their recordings) replace these later.

/** What fixing a corrupted file asks of the Recovery app. */
export type FileRecovery = {
  /** Which recovery puzzle to run (0-based, see src/apps/recovery). */
  puzzle: number;
  /** Lines of the summary shown once it is solved: `<count> <noun>`. */
  recoveries: { count: number; type: string }[];
};

export type FileItem = {
  id: string;
  name: string;
  type: 'video' | 'audio';
  /** Shape of the playback area for videos (width / height). */
  aspectRatio?: number;
  /** `MMM D, YYYY`. */
  date: string;
  /** `[episode, objective, checkpoint]` window in which the file exists. */
  start: [number, number, number];
  end?: [number, number, number];
  /** Cannot be opened until the Recovery app has restored it. */
  corrupted?: boolean;
  recovery?: FileRecovery;
  /** Captions shown while an audio file plays. */
  subtitles?: { text: string; duration: number }[];
};

const files: FileItem[] = [
  { id: 'symbolcoordinates', name: '[Placeholder] Clip A.mp4', type: 'video', aspectRatio: 1, date: 'Dec 23, 2022', start: [1, 0, 0] },
  {
    id: 'screenrecording',
    name: '[Placeholder] Screen recording.mp4',
    type: 'video',
    aspectRatio: 1,
    date: 'Dec 24, 2022',
    start: [1, 1, 0],
    corrupted: true,
    recovery: { puzzle: 0, recoveries: [{ count: 1, type: 'file' }] },
  },
  {
    id: 'recording',
    name: '[Placeholder] Voice note.mp3',
    type: 'audio',
    date: 'Aug 25, 2022',
    start: [1, 0, 0],
    subtitles: [
      { text: '[Placeholder] First caption line.', duration: 4000 },
      { text: '[Placeholder] Second caption line.', duration: 4000 },
      { text: '[Placeholder] Third caption line.', duration: 4000 },
    ],
  },
  { id: 'stickynotes', name: '[Placeholder] Clip B.mp4', type: 'video', aspectRatio: 1, date: 'Sep 18, 2022', start: [1, 0, 0] },
];

/** Clip played for each video file (placeholders from assets.videos). */
export const fileVideos: Record<string, typeof assets.videos.mist> = {
  symbolcoordinates: assets.videos.mist,
  screenrecording: assets.videos.recovery,
  stickynotes: assets.videos.connect,
};

/** Sound resource played for each audio file. */
export const fileSounds: Record<string, string> = { recording: 'office' };

export default files;
