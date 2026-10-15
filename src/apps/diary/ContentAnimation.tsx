import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DiaryLine, newWrapState, stepWrap } from './Content';

/** Delay between typed characters (ms). */
const CHAR_DELAY = 27;

/**
 * Types `content` out one character at a time. The text may keep growing (the diary reveals
 * lines as the recording plays); typing resumes whenever new characters arrive.
 */
export default function ContentAnimation({ content }: { content: string }) {
  const [lines, setLines] = useState<string[]>([]);
  const wrap = useRef(newWrapState(true));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const text = useRef(content);
  text.current = content;

  const type = useCallback(() => {
    timer.current = null;
    if (wrap.current.index >= text.current.length) return; // idle until more text arrives
    stepWrap(wrap.current, text.current);
    setLines([...wrap.current.lines]);
    timer.current = setTimeout(type, CHAR_DELAY);
  }, []);

  useEffect(() => {
    if (!timer.current) type();
  }, [content, type]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <>
      {lines.map((line, index) => (
        <DiaryLine key={index} text={line} width="100%" />
      ))}
    </>
  );
}
