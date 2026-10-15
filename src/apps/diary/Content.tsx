import React, { useMemo } from 'react';
import { Dimensions } from 'react-native';
import SmartText from '../../components/SmartText';

const { width: W } = Dimensions.get('screen');

/** Characters per handwritten line (the reference wraps by count, not by measuring). */
export const MAX_CHARS = Math.min(40, (W - (W % 5)) / 10);

/** Incremental word-wrap state: the diary types one character at a time. */
export type WrapState = { index: number; lines: string[]; lineIdx: number; afterSpace: boolean; highlight: boolean };

export const newWrapState = (afterSpace = false): WrapState => ({
  index: 0,
  lines: [],
  lineIdx: 0,
  afterSpace,
  highlight: false,
});

/**
 * Consumes the next character of `content`: breaks before a word that would not fit on the
 * line, and re-opens an active `^highlight^` at the start of the new line.
 */
export function stepWrap(state: WrapState, content: string, max = MAX_CHARS) {
  const char = content.charAt(state.index);
  let breakHere = false;
  if (state.afterSpace) {
    const nextWord = content.slice(state.index).split(' ')[0];
    const current = state.lines[state.lineIdx] ? state.lines[state.lineIdx].length : 0;
    breakHere = current + nextWord.length >= max - 1;
  }
  if (breakHere) state.lineIdx += 1;
  state.lines[state.lineIdx] = (state.lines[state.lineIdx] || '') + (breakHere && state.highlight ? '^' : '') + char;
  state.afterSpace = char === ' ';
  if (char === '^') state.highlight = !state.highlight;
  state.index += 1;
}

/** Wraps the whole text at once. */
export function wrapLines(content: string, max = MAX_CHARS): string[] {
  const state = newWrapState();
  while (state.index < content.length) stepWrap(state, content, max);
  return state.lines;
}

/** One handwritten line of diary text; `^` switches the highlight colour. */
export function DiaryLine({ text, width }: { text: string; width?: `${number}%` }) {
  return (
    <SmartText
      style={width ? { fontFamily: 'Caveat-Regular', width } : { fontFamily: 'Caveat-Regular' }}
      numberOfLines={1}
      ellipsizeMode="clip"
      noDefaultMargin
      text={text}
      variant="h3"
      color="#4A3616"
      highlightColor="#951111"
    />
  );
}

/** Diary entry text on the page: handwritten lines with `^highlights^`. */
export default function Content({ content }: { content: string }) {
  const lines = useMemo(() => wrapLines(content), [content]);
  return (
    <>
      {lines.map((line, index) => (
        <DiaryLine key={index} text={line} />
      ))}
    </>
  );
}
