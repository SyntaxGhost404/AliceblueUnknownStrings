import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import { scale } from '../../theme/scale';
import { DiaryPageData } from '../../content/mock/diary';

const { width: W } = Dimensions.get('screen');

type Props = { data: Pick<DiaryPageData, 'riddle' | 'answer'>; onSolve: () => void };

/**
 * The riddle guarding a diary page: one wheel per answer letter (all start on "a"); the
 * arrows step a letter up or down the alphabet, wrapping at the ends. The page unlocks the
 * moment the wheels spell the answer.
 */
export default function Riddle({ data, onSolve }: Props) {
  const [solved, setSolved] = useState(false);
  const [letters, setLetters] = useState<string[][]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLetters(data.answer.split(' ').map(word => word.split('').map(() => 'a')));
  }, [data]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleBlockClick = (word: number, index: number, delta: 1 | -1) => {
    if (solved) return;
    const code = letters[word][index].charCodeAt(0);
    let step: number = delta;
    if (delta === 1 && code >= 122) step = -25;
    if (delta === -1 && code <= 97) step = 25;
    const next = letters.map(row => [...row]);
    next[word][index] = String.fromCharCode(code + step);
    setLetters(next);
    if (next.flat().join('') === data.answer.replace(/ /g, '')) {
      setSolved(true);
      timer.current = setTimeout(onSolve, 400);
    }
  };

  const longest = Math.max(0, ...letters.map(word => word.length));
  const blockWidth = (W * 0.88 * 0.85) / longest - 3;
  const boxSize = (W * 0.88 * 0.85) / 4 - 3;

  return (
    <>
      <CustomText
        bold
        noDefaultMargin
        center
        variant="h3"
        text={data.riddle}
        style={{ fontFamily: 'Caveat-Regular', letterSpacing: scale(1), marginBottom: '2%', opacity: 0.6 }}
      />
      {letters.map((word, wordIndex) => (
        <View key={wordIndex} style={[styles.blocks, { marginTop: wordIndex === 0 ? '2%' : 0, opacity: 0.6 }]}>
          {word.map((letter, index) => (
            <View key={index} style={[styles.block, { width: blockWidth }]}>
              <CustomButton style={styles.button} activeOpacity={0.2} onPress={() => handleBlockClick(wordIndex, index, 1)}>
                <AntDesign name="up" size={scale(20)} />
              </CustomButton>
              <CustomText
                center
                noDefaultMargin
                text={letter}
                style={{
                  fontFamily: 'Caveat-Regular',
                  fontSize: scale(50),
                  width: '100%',
                  lineHeight: boxSize,
                  height: boxSize,
                  borderWidth: scale(1.5),
                  borderRadius: scale(8),
                }}
              />
              <CustomButton style={styles.button} activeOpacity={0.2} onPress={() => handleBlockClick(wordIndex, index, -1)}>
                <AntDesign name="down" size={scale(20)} />
              </CustomButton>
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  blocks: { width: '90%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  block: { justifyContent: 'center', alignItems: 'center', marginHorizontal: '0.6%' },
  button: { width: '100%', justifyContent: 'center', alignItems: 'center', aspectRatio: 2.3 },
});
