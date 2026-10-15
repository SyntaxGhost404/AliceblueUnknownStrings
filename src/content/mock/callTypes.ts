import { CallLine, CallScript, GameAction } from '../types';

// Optional call-script extensions. Everything here is data-driven: a script may stay in the flat
// `CallScript` shape (lines + one round of replies) or describe a small state graph like the
// reference build's call content (`#0`, `#1`, ... with replies, phone-menu keys and hang-up).

/** A reply the player can pick; it leads to another state. */
export type CallReply = { text: string; next?: string };

export type CallState = {
  /** Spoken lines, each shown as the live caption for its `duration`. */
  lines: CallLine[];
  /** Wait before the lines start (ms, default 300). */
  delay?: number;
  /** State to run as soon as the lines finish. */
  next?: string;
  /** Timed replies offered once the lines finish (8 s to choose, then a random one is taken). */
  replies?: CallReply[];
  /** Phone menu: wait for keypad digits; the typed sequence must contain `keys` to match. */
  inputs?: { keys: string; next: string }[];
  /** Hang up when this many digits were typed without a match. */
  inputLimit?: number;
  /** "Share Your Screen" button shown once the lines finish; pressing it plays a tone and continues. */
  shareScreen?: { next?: string; action?: GameAction | null };
  /** Hang up shortly after the lines finish. */
  end?: boolean;
  /** Engine action fired when the lines finish. */
  action?: GameAction | null;
  /** Minimise the call into the floating bubble while this state plays. */
  mode?: 'floating';
};

export type CallStates = Record<string, CallState>;

export type CallScriptX = CallScript & {
  /**
   * `conversation` (character view + replies), `automated` (character view, no replies) or
   * unset for phone menus, which show the captions above the keypad. Flat scripts are `conversation`.
   */
  method?: 'conversation' | 'automated';
  /** State graph starting at `#0`; when given, `lines` and `options` are ignored. */
  states?: CallStates;
};

/** A contact that only exists for calls (not in the shared contacts list). */
export type CallContact = { name: string; number: string };
