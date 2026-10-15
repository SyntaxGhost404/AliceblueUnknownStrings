import React, { useEffect, useState } from 'react';
import { Animated } from 'react-native';
import CustomButton from '../../../components/CustomButton';
import { scale } from '../../../theme/scale';
import { Board, boardStyles, flipRotation, ReloadButton, SCREEN_H, SCREEN_W, TILE_SOUND, TileFaces, usePuzzleFrame } from '../puzzleKit';

const SIZE = 6;
/** 1 = lit. The picture is solved when every tile is lit. */
const START = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
const BOARD = SCREEN_W * 0.78;
const BLOCK = (BOARD * 15.666666666666668) / 100;
const GAP = (BOARD - SIZE * BLOCK) / (SIZE - 1);

const styles = boardStyles(BOARD, { menuHeight: SCREEN_H * 0.06 });

/** Puzzle 4: lights out - pressing a tile flips it and its four neighbours; light up the whole grid. */
export default function Puzzle4({ onSolve }: { onSolve: () => void }) {
  const frame = usePuzzleFrame(onSolve, { boardW: BOARD });
  const [tiles, setTiles] = useState<number[]>([]);

  const initialize = () => {
    if (frame.solved) return;
    setTiles([...START]);
  };

  useEffect(initialize, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tiles.length !== 0 && !tiles.includes(0)) frame.celebrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles]);

  const onPress = (index: number) => {
    if (frame.solved) return;
    const next = [...tiles];
    const flip = (i: number) => {
      next[i] = 1 - next[i];
    };
    flip(index);
    if (Math.floor(index / SIZE) > 0) flip(index - SIZE);
    if (index % SIZE < SIZE - 1) flip(index + 1);
    if (Math.floor(index / SIZE) < SIZE - 1) flip(index + SIZE);
    if (index % SIZE > 0) flip(index - 1);
    setTiles(next);
  };

  return (
    <Board
      frame={frame}
      styles={styles}
      menu={<ReloadButton onPress={initialize} style={{ backgroundColor: '#1c2a36' }} />}>
      <Animated.View style={styles.blocks}>
        {tiles.map((value, index) => (
          <Animated.View
            key={index}
            style={{
              position: 'absolute',
              width: BLOCK,
              aspectRatio: 1,
              borderRadius: scale(2),
              overflow: 'hidden',
              top: BLOCK * Math.floor(index / SIZE) + GAP * Math.floor(index / SIZE),
              left: BLOCK * (index % SIZE) + GAP * (index % SIZE),
              transform: [{ rotateY: flipRotation(frame.flip, index, tiles.length) }],
            }}>
            <CustomButton
              activeOpacity={0.6}
              sound={TILE_SOUND}
              onPress={() => onPress(index)}
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: scale(6),
                borderColor: '#1c2a36',
                backgroundColor: value === 1 ? 'transparent' : '#1c2a36',
              }}>
              <TileFaces flip={frame.flip} solved={frame.solved} />
            </CustomButton>
          </Animated.View>
        ))}
      </Animated.View>
    </Board>
  );
}
