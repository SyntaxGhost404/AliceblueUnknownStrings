import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import CustomText from '../../components/CustomText';

type Props = {
  text: string;
  /** Called a moment after the last character has been typed. */
  runNextLine?: () => void;
  bold?: boolean;
  /** Prompt shown in front of the line while it types. */
  startChar?: string;
  /** Cursor shown at the end of the line while it types. */
  endChar?: string;
  /** Milliseconds per character. */
  durationPerChar?: number;
};

/** One line of the recovery console, typed out character by character with a block cursor. */
export default function ConsoleLine({ text, runNextLine, bold, startChar = '', endChar = '▋', durationPerChar = 10 }: Props) {
  const [index, setIndex] = useState(0);
  const next = useRef(runNextLine);
  next.current = runNextLine;

  useEffect(() => {
    const timer = setInterval(() => setIndex(n => (n >= text.length ? n : n + 1)), durationPerChar);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (index < text.length) return;
    const timer = setTimeout(() => next.current?.(), 200);
    return () => clearTimeout(timer);
  }, [index, text.length]);

  const typing = index < text.length;
  return (
    <View style={styles.parentLayout}>
      {typing ? <CustomText mono variant="subtext" white text={startChar} /> : null}
      {text
        .split('')
        .slice(0, index)
        .map((char, i) => (
          <CustomText
            key={i}
            style={{ fontWeight: bold ? 'bold' : 'normal' }}
            mono
            variant="caption"
            white
            text={char}
          />
        ))}
      {typing ? <CustomText mono variant="subtext" white text={endChar} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { width: '100%', flexDirection: 'row', alignItems: 'flex-start' },
});
