import { CallScriptX, CallStates } from '../../content/mock/callTypes';
import { GameAction } from '../../content/types';

/** A call script ready to run: always a state graph starting at `#0`. */
export type CallInstance = {
  method?: 'conversation' | 'automated';
  /** Ring time before the contact picks up an outgoing call (ms). */
  delay?: number;
  dontSave?: boolean;
  /** Fired once the call connects. */
  action?: GameAction | null;
  states: CallStates;
};

/**
 * Turns a script into a state graph. Flat scripts (lines + one round of replies) become `#0` plus
 * one hang-up state per reply, so the call engine only has to know about states.
 */
export function toInstance(script: CallScriptX): CallInstance {
  const base = { delay: script.delay, dontSave: script.dontSave, action: script.action };
  if (script.states) return { ...base, method: script.method, states: script.states };

  const replies = script.options ?? [];
  const states: CallStates = {
    '#0': {
      lines: script.lines,
      replies: replies.length ? replies.map((reply, i) => ({ text: reply.text, next: `#${i + 1}` })) : undefined,
      end: !replies.length,
    },
  };
  replies.forEach((reply, i) => {
    states[`#${i + 1}`] = { lines: reply.lines, action: reply.action, end: true };
  });
  return { ...base, method: script.method ?? 'conversation', states };
}
