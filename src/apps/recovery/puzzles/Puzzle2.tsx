import React, { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';
import { ArrowUp, X } from 'lucide-react-native';
import CustomButton from '../../../components/CustomButton';
import { scale } from '../../../theme/scale';
import {
  Board,
  BOARD_W,
  boardStyles,
  flipRotation,
  ReloadButton,
  TILE_SOUND,
  TileFaces,
  usePuzzleFrame,
} from '../puzzleKit';

const SIZE = 3;
/** Tile kinds: -1 is a blocked tile (must stay dark), 0 is a tile that has to light up. */
const KINDS = [-1, 0, -1, -1, 0, 0, 0, 0, 0];
const TILE = BOARD_W * 0.32333333333333336;

const styles = boardStyles(BOARD_W, { blocksJustify: 'space-between' });

/** Direction after `dir`: 1 up, 2 right, 3 down, 4 left, 0 none. Skips directions that point off the board. */
function nextDirection(position: number, dir: number): number {
  const next = dir !== 4 ? dir + 1 : 0;
  switch (next) {
    case 0:
      return 0;
    case 1:
      return position - SIZE > -1 ? 1 : nextDirection(position, 1);
    case 2:
      return (position + 1) % SIZE !== 0 ? 2 : nextDirection(position, 2);
    case 3:
      return position + SIZE < SIZE * SIZE ? 3 : nextDirection(position, 3);
    default:
      return position !== 0 && (position - 1) % SIZE !== 2 ? 4 : nextDirection(position, 4);
  }
}

/** Adds `delta` to the tile itself and to every tile its arrow points at, up to the edge. */
function applyBeam(counts: number[], position: number, dir: number, delta: number) {
  if (dir === 0) return;
  if (dir === 2 || dir === 4) {
    const row = Math.floor(position / SIZE);
    const step = dir === 2 ? 1 : -1;
    let at = position;
    while (Math.floor(at / SIZE) === row) {
      counts[at] += delta;
      at += step;
    }
    return;
  }
  const step = dir === 1 ? -SIZE : SIZE;
  let at = position;
  while (Math.floor(at / SIZE) > -1 && Math.floor(at / SIZE) < SIZE) {
    counts[at] += delta;
    at += step;
  }
}

/** Puzzle 2: turn the arrows so that every open tile is lit an odd number of times and blocked tiles are not. */
export default function Puzzle2({ onSolve }: { onSolve: () => void }) {
  const frame = usePuzzleFrame(onSolve);
  const [counts, setCounts] = useState<number[]>([]);
  const [dirs, setDirs] = useState<number[]>([]);

  const initialize = () => {
    setCounts(KINDS.map(() => 0));
    setDirs(KINDS.map(() => 0));
  };

  useEffect(initialize, []);

  useEffect(() => {
    if (counts.length === 0) return;
    const pattern = counts.map(count => (count % 2) - 1).join('');
    if (pattern === KINDS.join('')) frame.celebrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts]);

  const onPress = (index: number) => {
    if (frame.solved) return;
    const next = [...counts];
    const nextDirs = [...dirs];
    applyBeam(next, index, nextDirs[index], -1);
    nextDirs[index] = nextDirection(index, nextDirs[index]);
    applyBeam(next, index, nextDirs[index], 1);
    setDirs(nextDirs);
    setCounts(next);
  };

  return (
    <Board frame={frame} styles={styles} menu={<ReloadButton onPress={initialize} />}>
      <Animated.View style={styles.blocks}>
        {KINDS.map((kind, index) => {
          const lit = counts[index] % 2 === 1;
          return (
            <Animated.View
              key={index}
              style={{
                width: TILE,
                aspectRatio: 1,
                borderRadius: scale(2),
                overflow: 'hidden',
                marginVertical: '0.75%',
                transform: [{ rotateY: kind !== -1 ? flipRotation(frame.flip, index, KINDS.length) : '0deg' }],
              }}>
              <CustomButton
                disabled={kind === -1}
                activeOpacity={0.6}
                sound={TILE_SOUND}
                onPress={() => onPress(index)}
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: lit ? (kind === -1 ? '#2b3945' : '#DC444466') : '#0b1925DD',
                }}>
                {kind === -1 ? (
                  <X size={scale(24)} color="white" />
                ) : (
                  <TileFaces flip={frame.flip} solved={frame.solved}>
                    {dirs[index] ? (
                      <View style={{ transform: [{ rotateZ: `${(dirs[index] - 1) * 90}deg` }] }}>
                        <ArrowUp size={scale(24)} color="white" />
                      </View>
                    ) : null}
                  </TileFaces>
                )}
              </CustomButton>
            </Animated.View>
          );
        })}
      </Animated.View>
    </Board>
  );
}
