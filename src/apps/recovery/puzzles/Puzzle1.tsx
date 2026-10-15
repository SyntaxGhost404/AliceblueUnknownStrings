import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import CustomButton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';
import { scale } from '../../../theme/scale';
import { playAnimation } from '../../../theme/animation';
import {
  Board,
  BOARD_W,
  boardStyles,
  flipRotation,
  ReloadButton,
  TILE_SOUND,
  TileFaces,
  usePuzzleFrame,
  useShake,
} from '../puzzleKit';

const SIZE = 4;
const MOVES = 5;
/** Scrambled start: tile `value` sits at index `position`; solved when value === position. */
const START = [4, 1, 2, 3, 0, 9, 5, 6, 8, 13, 10, 11, 12, 7, 14, 15];
const BLOCK = (BOARD_W * 24) / 100;
const GAP = (BOARD_W - SIZE * BLOCK) / (SIZE - 1);
const MOVE_MS = 350;

type Block = { value: number; position: number };

const styles = boardStyles(BOARD_W, { menuJustify: 'space-between' });
const column = (position: number) => (position % SIZE) * (BLOCK + GAP);
const row = (position: number) => Math.floor(position / SIZE) * (BLOCK + GAP);

/** Puzzle 1: put the numbered tiles in order by swapping neighbours - in five moves or fewer. */
export default function Puzzle1({ onSolve }: { onSolve: () => void }) {
  const frame = usePuzzleFrame(onSolve);
  const { shake, run: runShake } = useShake();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [moves, setMoves] = useState(MOVES);
  const [selected, setSelected] = useState(-1);
  const [neighbours, setNeighbours] = useState<number[]>([]);
  const [failed, setFailed] = useState(false);
  const moveX = useRef<Animated.Value[]>([]);
  const moveY = useRef<Animated.Value[]>([]);

  const initialize = () => {
    if (frame.solved) return;
    setFailed(false);
    setMoves(MOVES);
    setSelected(-1);
    moveX.current = START.map((_, i) => new Animated.Value(column(i)));
    moveY.current = START.map((_, i) => new Animated.Value(row(i)));
    setBlocks(START.map((value, position) => ({ value, position })));
  };

  useEffect(initialize, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Tiles next to the selected one can be swapped with it.
  useEffect(() => {
    if (selected === -1) {
      setNeighbours([]);
      return;
    }
    const list: number[] = [];
    if (selected % SIZE !== 0) list.push(selected - 1);
    if (selected % SIZE !== SIZE - 1) list.push(selected + 1);
    if (Math.floor(selected / SIZE) !== 0) list.push(selected - SIZE);
    if (Math.floor(selected / SIZE) !== SIZE - 1) list.push(selected + SIZE);
    setNeighbours(list);
  }, [selected]);

  // Solved: celebrate. Out of moves: the board turns red until it is reloaded.
  useEffect(() => {
    if (blocks.length === 0) return;
    if (!blocks.find(block => block.position !== block.value && block.value !== -1)) {
      frame.celebrate();
    } else if (moves === 0) {
      frame.later(() => {
        setFailed(true);
        frame.play('bubble.mp3');
        runShake();
      }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moves, blocks]);

  const onPress = (position: number) => {
    if (moves === 0 || frame.solved || failed) return;
    if (neighbours.includes(position) && selected !== -1) {
      const next = blocks.map(block => ({ ...block }));
      const a = next.findIndex(block => block.position === selected);
      const b = next.findIndex(block => block.position === position);
      [next[a].position, next[b].position] = [next[b].position, next[a].position];
      // Neighbours on a row slide sideways, neighbours in a column slide up or down.
      const horizontal = Math.abs(selected - position) === 1;
      [a, b].forEach(i => {
        const target = horizontal ? moveX.current[i] : moveY.current[i];
        playAnimation(target, horizontal ? column(next[i].position) : row(next[i].position), MOVE_MS, Easing.linear, false);
      });
      setSelected(-1);
      setBlocks(next);
      setMoves(value => value - 1);
    } else {
      setSelected(position === selected ? -1 : position);
    }
  };

  const tint = failed ? '#DC444466' : '#0b1925CC';

  return (
    <Board
      frame={frame}
      styles={styles}
      overflow={failed ? 'visible' : 'hidden'}
      menu={
        <>
          <Animated.View style={[styles.menuItem, { backgroundColor: tint, transform: [{ translateX: shake }] }]}>
            <CustomText mono variant="h4" white text={moves} style={{ color: '#FFFFFFCC' }} />
          </Animated.View>
          <ReloadButton onPress={initialize} />
        </>
      }>
      <Animated.View style={[styles.blocks, { transform: [{ translateX: 0 }] }]}>
        {blocks.length !== 0
          ? blocks.map((block, index) => (
              <Animated.View
                key={index}
                style={{
                  position: 'absolute',
                  width: BLOCK,
                  aspectRatio: 1,
                  borderRadius: scale(2),
                  overflow: 'hidden',
                  transform: [
                    { translateX: moveX.current[index] },
                    { translateY: moveY.current[index] },
                    { rotateY: flipRotation(frame.flip, index, START.length) },
                  ],
                }}>
                <CustomButton
                  disabled={moves === 0}
                  activeOpacity={0.6}
                  sound={TILE_SOUND}
                  onPress={() => onPress(block.position)}
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: tint,
                    borderWidth: selected === block.position ? scale(4) : neighbours.includes(block.position) ? scale(2) : 0,
                    borderColor: selected === block.position ? '#1B3953' : '#1B395399',
                  }}>
                  <TileFaces flip={frame.flip} solved={frame.solved}>
                    <CustomText
                      mono
                      variant="h4"
                      white
                      text={`${block.value + 1}`}
                      style={{ fontWeight: 'bold', color: block.value === block.position ? '#FFFFFF99' : '#DC4444' }}
                    />
                  </TileFaces>
                </CustomButton>
              </Animated.View>
            ))
          : null}
      </Animated.View>
    </Board>
  );
}
