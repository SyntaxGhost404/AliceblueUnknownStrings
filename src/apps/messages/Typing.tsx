import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { createAnimation, playAnimation } from '../../theme/animation';
import contacts from '../../content/mock/contacts';

const { width: W } = Dimensions.get('screen');

/** "…" bubble: three dots hopping in turn. Group chats name who is typing. */
export default function Typing({ sender, group }: { sender?: string | null; group?: boolean }) {
  const [fade] = useState(() => new Animated.Value(0));
  const [dots] = useState(() => [new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]);

  useEffect(() => {
    playAnimation(fade, 1, 200);
    const up = Animated.sequence(dots.map(d => createAnimation(d, -4, 200, Easing.ease)));
    const down = Animated.sequence(dots.map(d => createAnimation(d, 4, 200, Easing.ease)));
    const loop = Animated.loop(Animated.sequence([up, down]), { iterations: -1 });
    loop.start();
    return () => loop.stop();
  }, [fade, dots]);

  const showName = group && !!sender;

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      <View
        style={[
          styles.message,
          {
            flexDirection: showName ? 'column' : 'row',
            backgroundColor: (theme as any).myphone.messages.colors.chat.message1,
            paddingHorizontal: showName ? '4%' : '4.5%',
            paddingTop: showName ? '1%' : '4.5%',
            paddingBottom: showName ? '2%' : '4.5%',
          },
        ]}>
        {showName ? (
          <CustomText
            variant="subtext"
            bold
            noDefaultMargin
            style={{ color: '#FFFFFF33', marginRight: '10%' }}
            text={contacts[sender!]?.name ?? sender}
          />
        ) : null}
        <View style={[styles.dots, { width: showName ? W * 0.07 : W * 0.08 }]}>
          {dots.map((d, index) => (
            <Animated.View
              key={index}
              style={[styles.dot, { width: showName ? W * 0.017 : W * 0.021, transform: [{ translateY: d }] }]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '0%' },
  message: { maxWidth: '84%', borderRadius: scale(18), justifyContent: 'flex-start', alignItems: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dot: { aspectRatio: 1, backgroundColor: '#FFFFFF22', borderRadius: scale(100) },
});
