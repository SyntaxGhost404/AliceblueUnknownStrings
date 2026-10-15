import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { playAnimation } from '../../theme/animation';
import { CallReply } from '../../content/mock/callTypes';

/** Time the player has to choose before a reply is picked at random. */
export const OPTIONS_TIME = 8000;
const PICK_TIME = 600;
const HOLD_TIME = 800;
const DIM = 0.35;

/**
 * Timed call replies, shared by the call screen and the floating bubble: replies fade in dimmed
 * with a shrinking bar; picking one (or running out of time) highlights it, fades the rest and
 * then hands the choice to `onPick`.
 */
export function useCallOptions(options: CallReply[] | null, showTime: number, onPick: (index: number) => void) {
  const count = options?.length ?? 0;
  const anims = useRef<Animated.Value[]>([]);
  while (anims.current.length < Math.max(2, count)) anims.current.push(new Animated.Value(0));
  const [bar] = useState(() => new Animated.Value(0));
  const [countdown] = useState(() => new Animated.Value(1));
  const [ready, setReady] = useState(false);
  const [chosen, setChosen] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const running = useRef<Animated.CompositeAnimation | null>(null);
  const pick = useRef(onPick);
  pick.current = onPick;

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    running.current?.stop();
    running.current = null;
  }, []);

  const select = useCallback(
    (index: number) => {
      clear();
      setChosen(true);
      anims.current.forEach((anim, i) => playAnimation(anim, i === index ? 1 : 0, PICK_TIME));
      playAnimation(bar, 0, PICK_TIME);
      timers.current.push(
        setTimeout(() => {
          playAnimation(anims.current[index], 0, PICK_TIME);
          timers.current.push(
            setTimeout(() => {
              countdown.setValue(1);
              setReady(false);
              pick.current(index);
            }, PICK_TIME),
          );
        }, HOLD_TIME),
      );
    },
    [bar, countdown, clear],
  );

  useEffect(() => {
    if (!count) return;
    setChosen(false);
    setReady(true);
    countdown.setValue(1);
    bar.setValue(0);
    anims.current.forEach(anim => anim.setValue(0));
    running.current = playAnimation(countdown, 0, OPTIONS_TIME);
    timers.current.push(setTimeout(() => select(Math.floor(Math.random() * count)), OPTIONS_TIME));
    for (let i = 0; i < count; i++) playAnimation(anims.current[i], DIM, showTime);
    playAnimation(bar, 1, showTime);
    return clear;
    // Restart only when a new set of replies arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return { anims: anims.current, bar, countdown, disabled: !ready || chosen, select };
}
