import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomButton from '../../components/CustomButton';
import { scale } from '../../theme/scale';
import { createAnimation, playAnimation } from '../../theme/animation';
import { playSound } from '../../audio/sound';
import { GlobalContext } from '../../state/GlobalProvider';

// Pieces shared by the recovery puzzles. Every puzzle in the reference build repeats the same
// scaffolding: the board slides open, a small menu sits on top (reload, move counter), and
// solving flips the tiles over one by one before the board slides shut again.

export const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen');

/** Default board width (most puzzles use 80% of the screen). */
export const BOARD_W = SCREEN_W * 0.8;

/** Click sound the puzzle buttons use. */
export const TILE_SOUND = 'message2.mp3';

/** Timers that are cleared when the puzzle goes away. */
export function useTimers() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return useCallback((fn: () => void, delay: number) => {
    const timer = setTimeout(fn, delay);
    timers.current.push(timer);
    return timer;
  }, []);
}

/** Plays a one-shot effect unless sounds are switched off. */
export function useEffectSound() {
  const { soundsEnabled } = useContext(GlobalContext);
  return useCallback(
    (name: string) => {
      if (soundsEnabled) playSound(name);
    },
    [soundsEnabled],
  );
}

export type SuccessTiming = {
  /** Pause between the last move and the celebration. */
  delay: number;
  /** Duration of the tile flip. */
  flip: number;
  /** When (after the flip starts) the tiles show their check marks. */
  flag: number;
  /** When the board starts to close. */
  close: number;
  /** When the puzzle reports itself solved. */
  finish: number;
};

export const DEFAULT_TIMING: SuccessTiming = { delay: 800, flip: 1200, flag: 600, close: 2700, finish: 3300 };

type FrameOptions = { boardW?: number; timing?: SuccessTiming };

/**
 * Opening and closing of a puzzle: the board's width animates from 0 (puzzleopen.mp3 plays),
 * and `celebrate()` runs the solved sequence (flip, success.mp3, close, then `onSolve`).
 */
export function usePuzzleFrame(onSolve: () => void, { boardW = BOARD_W, timing = DEFAULT_TIMING }: FrameOptions = {}) {
  const later = useTimers();
  const play = useEffectSound();
  const [width] = useState(() => new Animated.Value(0));
  const [flip] = useState(() => new Animated.Value(0));
  const [solved, setSolved] = useState(false);
  const finished = useRef(false);
  const callback = useRef(onSolve);
  callback.current = onSolve;

  useEffect(() => {
    play('puzzleopen.mp3');
    playAnimation(width, boardW, 500, Easing.ease, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const celebrate = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    later(() => {
      playAnimation(flip, 1, timing.flip, Easing.out(Easing.ease), false);
      play('success.mp3');
      later(() => setSolved(true), timing.flag);
      later(() => playAnimation(width, 0, 600, Easing.ease, false), timing.close);
      later(() => callback.current(), timing.finish);
    }, timing.delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [later, play]);

  return { width, flip, solved, setSolved, celebrate, later, play, boardW };
}

export type Frame = ReturnType<typeof usePuzzleFrame>;

/** Rotation of tile `index` (of `count`) while the board flips: tiles turn over one after another. */
export function flipRotation(flip: Animated.Value, index: number, count: number) {
  const step = 0.5 / Math.max(count - 1, 1);
  return flip.interpolate({
    inputRange: [0, step * index, step * index + 0.5, 1],
    outputRange: ['0deg', '0deg', '180deg', '180deg'],
  });
}

/** A tile's two faces: its content until the flip passes halfway, then a check mark. */
export function TileFaces({ flip, solved, children }: { flip: Animated.Value; solved: boolean; children?: React.ReactNode }) {
  if (solved) {
    return (
      <Animated.View
        style={{ opacity: flip.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1] }), transform: [{ rotateY: '180deg' }] }}>
        <Check size={scale(36)} color="#FFFFFF99" />
      </Animated.View>
    );
  }
  return <Animated.View style={{ opacity: flip.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0] }) }}>{children}</Animated.View>;
}

/** Shake used when an attempt fails: two quick left-right swings. */
export function useShake() {
  const later = useTimers();
  const [shake] = useState(() => new Animated.Value(0));
  const run = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        createAnimation(shake, -3, 80, Easing.linear),
        createAnimation(shake, 3, 80, Easing.linear),
      ]),
      { iterations: 2 },
    ).start();
    later(() => shake.setValue(0), 500);
  }, [shake, later]);
  return { shake, run };
}

type StyleOptions = { menuHeight?: number; menuJustify?: ViewStyle['justifyContent']; blocksJustify?: ViewStyle['justifyContent'] };

/** Layout shared by the board-style puzzles. */
export function boardStyles(boardW: number, { menuHeight = SCREEN_H * 0.07, menuJustify = 'center', blocksJustify = 'flex-start' }: StyleOptions = {}) {
  return StyleSheet.create({
    parentLayout: {
      width: boardW,
      height: boardW + SCREEN_H * 0.1,
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderWidth: scale(0),
      borderColor: 'red',
    },
    menu: {
      position: 'absolute',
      top: 0,
      alignSelf: 'center',
      width: boardW,
      height: menuHeight,
      flexDirection: 'row',
      justifyContent: menuJustify,
      alignItems: 'center',
    },
    menuItem: {
      height: '100%',
      aspectRatio: 1,
      borderRadius: scale(100),
      backgroundColor: '#0b1925CC',
      justifyContent: 'center',
      alignItems: 'center',
    },
    blocks: {
      position: 'absolute',
      bottom: 0,
      alignSelf: 'center',
      width: boardW,
      aspectRatio: 1,
      flexDirection: 'row',
      justifyContent: blocksJustify,
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      borderWidth: scale(0),
      borderColor: 'blue',
    },
  });
}

/** Round reload button every puzzle carries in its menu. */
export function ReloadButton({ onPress, style }: { onPress: () => void; style?: ViewStyle }) {
  return (
    <CustomButton activeOpacity={0.6} style={[menuItemStyle, style]} sound={TILE_SOUND} onPress={onPress}>
      <AntDesign name="reload1" size={scale(18)} color="#FFFFFFCC" />
    </CustomButton>
  );
}

const menuItemStyle: ViewStyle = {
  height: '100%',
  aspectRatio: 1,
  borderRadius: scale(100),
  backgroundColor: '#0b1925CC',
  justifyContent: 'center',
  alignItems: 'center',
};

/** The sliding board: its width follows the opening animation. */
export function Board({
  frame,
  styles,
  overflow = 'hidden',
  menu,
  children,
}: {
  frame: Frame;
  styles: ReturnType<typeof boardStyles>;
  overflow?: 'hidden' | 'visible';
  menu: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Animated.View style={[styles.parentLayout, { width: frame.width, overflow }]}>
      <View style={styles.menu}>{menu}</View>
      {children}
    </Animated.View>
  );
}
