import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import { scale } from '../../theme/scale';
import { playAnimation } from '../../theme/animation';
import { getAppString } from '../../content/appStrings';
import { HIDDEN_PATTERN } from '../../content/mock/gallery';

const EMPTY = [0, 0, 0, 0, 0, 0, 0, 0, 0];

type Props = { setIsLocked: (locked: boolean) => void };

/**
 * 3x3 block lock. Blocks light up as they are tapped (each once); the right order fades the
 * lock out and opens the album, nine blocks in the wrong order flash red and start over.
 */
export default function PatternLock({ setIsLocked }: Props) {
  const [opacity] = useState(() => new Animated.Value(1));
  const [blocks, setBlocks] = useState<number[]>(EMPTY);
  const [pattern, setPattern] = useState<number[]>([]);
  const [failed, setFailed] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (pattern.length === 0) return;
    if (pattern.join('') === HIDDEN_PATTERN) {
      playAnimation(opacity, 0, 600);
      timers.current.push(setTimeout(() => setIsLocked(false), 800));
    } else if (pattern.length === 9) {
      setFailed(true);
      setBlocks(EMPTY);
      setPattern([]);
      timers.current.push(setTimeout(() => setFailed(false), 500));
    }
  }, [pattern, opacity, setIsLocked]);

  const onPress = (index: number) => {
    if (blocks[index] === 1) return;
    setPattern(prev => [...prev, index]);
    setBlocks(prev => {
      const next = [...prev];
      next[index] = 1;
      return next;
    });
  };

  return (
    <Animated.View style={[styles.parentLayout, { opacity }]}>
      <CustomText
        noDefaultMargin
        variant="h5"
        center
        white
        text={getAppString('herphone', 'gallery', 'unlock_images')}
        style={{ marginBottom: '4%' }}
      />
      <View style={styles.blocks}>
        {blocks.map((state, index) => (
          <CustomButton
            key={index}
            activeOpacity={0.6}
            onPress={() => onPress(index)}
            style={[styles.block, { backgroundColor: failed ? '#B56363' : state === 1 ? '#73738F' : '#353544' }]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { width: '100%', height: '90%', justifyContent: 'center', alignItems: 'center' },
  blocks: { width: '70%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' },
  block: { width: '30%', aspectRatio: 1, borderRadius: scale(10), marginVertical: '2%' },
});
