import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Pencil } from 'lucide-react-native';
import CustomText from '../components/CustomText';
import theme from '../theme/theme';
import { GlobalContext } from '../state/GlobalProvider';
import { ContentContext } from '../state/ContentProvider';
import { createAnimation, playAnimation } from '../theme/animation';
import { scale } from '../theme/scale';

let hideTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Clue-noted toast. `text` is "<info index>_<progress>"; the pencil scribbles in a loop
 * while the gathered clue and the "(n/m)" progress are shown.
 */
export default function Toast({ text }: { text: string }) {
  const { session, setToast } = useContext(GlobalContext);
  const { getMainStoryEvent } = useContext(ContentContext);
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [spinAnim] = useState(() => new Animated.Value(0));
  const [moveAnim] = useState(() => new Animated.Value(0));
  const scribble = useRef<Animated.CompositeAnimation | null>(null);

  const event: any = getMainStoryEvent(session, true);
  const [index, progress] = text.split('_');
  const info = event?.infos ? event.infos[index] : event?.gather?.infos?.[Number(index)]?.text;
  const label = `${info ?? ''} ${progress ?? ''}`;

  useEffect(() => {
    if (hideTimer) clearTimeout(hideTimer);
    playAnimation(fadeAnim, 1, 300);
    if (scribble.current) {
      scribble.current.reset();
      moveAnim.setValue(0);
      spinAnim.setValue(0);
    }
    scribble.current = Animated.loop(
      Animated.sequence([
        createAnimation(moveAnim, 1, 600),
        Animated.delay(100),
        Animated.parallel([createAnimation(spinAnim, 1, 550), createAnimation(moveAnim, 0, 550)]),
      ]),
    );
    scribble.current.start();
    hideTimer = setTimeout(() => setToast(null), 4000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label]);

  useEffect(() => () => scribble.current?.stop(), []);

  if (!event?.gather) return null;

  return (
    <Animated.View style={[styles.parentLayout, { opacity: fadeAnim }]}>
      <Animated.View
        style={{
          width: '14%',
          aspectRatio: 1,
          justifyContent: 'center',
          alignItems: 'center',
          transform: [
            { translateX: moveAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 8] }) },
            { rotate: '-30deg' },
            { rotate: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] }) },
          ],
        }}>
        <Pencil style={{ width: '100%', aspectRatio: 1 }} color={theme.colors.white} size={scale(18)} />
      </Animated.View>
      <CustomText
        style={{ width: '83%', marginBottom: '0.8%', letterSpacing: 0.5, fontSize: scale(14) }}
        bold
        noDefaultMargin
        white
        variant="subtext"
        text={label}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  parentLayout: {
    width: '88%',
    alignSelf: 'center',
    position: 'absolute',
    bottom: '6%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#202020FE',
    paddingVertical: '5%',
    paddingHorizontal: '6%',
    borderRadius: scale(40),
  },
});
