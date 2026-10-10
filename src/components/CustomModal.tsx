import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { createAnimation, playAnimation } from '../theme/animation';

type Props = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  backdropColor?: string;
  children?: React.ReactNode;
};

/** In-phone modal: fades in over a tinted backdrop; tapping the backdrop dismisses it. */
export default function CustomModal({ visible, setVisible, backdropColor = '#0e0e0eee', children }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    playAnimation(anim, visible ? 1 : 0, 250);
  }, [visible, anim]);

  if (!visible) return null;

  const onBackdropPress = () => createAnimation(anim, 0, 150).start(() => setVisible(false));

  return (
    <Animated.View style={[styles.modal, { opacity: anim }]}>
      <View onTouchStart={onBackdropPress} style={[styles.backdrop, { backgroundColor: backdropColor }]} />
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  modal: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  backdrop: { position: 'absolute', width: '100%', height: '100%' },
});
