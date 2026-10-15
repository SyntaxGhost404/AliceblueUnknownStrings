// MOCK DATA — what the data-recovery app shows around its puzzles. The console lines are
// generic interface copy; the jobs (which puzzle, what gets restored) come from the story
// or from the app that asks for a recovery (e.g. a corrupted file in Files).

/** One recovery assignment. */
export type RecoveryJob = {
  /** Which puzzle to run (0-based: 0 = Puzzle1 ... 12 = Puzzle13). */
  puzzle: number;
  /** Summary lines shown after solving: `<count> <noun>` where `type` is a key of the strings below. */
  recoveries: { count: number; type: string }[];
  /** Items to mark as recovered when the job is finished, by app: `{ files: ['id'] }`. */
  recovered?: Record<string, string[]>;
  /** Screen of the phone navigator to return to afterwards (default: the home screen). */
  returnTo?: string;
};

/** Lines typed out before the puzzle appears. */
export const consoleLines = [
  'Entering data recovery mode...',
  'Locating bad sectors...',
  'Preparing override interface...',
];

/** Job used when none was supplied. */
export const defaultJob: RecoveryJob = { puzzle: 0, recoveries: [{ count: 1, type: 'file' }] };
