import React from 'react';
import { StyleSheet, View } from 'react-native';

/** Web preview stand-in for the native blur view (the native module has no web build). */
export default function BlurOverlay({ amount }: { amount: number }) {
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backdropFilter: `blur(${amount / 2}px)` } as any]} />;
}
