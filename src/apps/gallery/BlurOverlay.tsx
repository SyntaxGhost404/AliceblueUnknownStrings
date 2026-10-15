import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';

/** Blurs whatever sits under it (the viewer's blur tool); `amount` is on the tool's 0-50 scale. */
export default function BlurOverlay({ amount }: { amount: number }) {
  return (
    <BlurView
      style={StyleSheet.absoluteFill}
      overlayColor="transparent"
      blurType="dark"
      blurAmount={amount}
      reducedTransparencyFallbackColor="transparent"
    />
  );
}
