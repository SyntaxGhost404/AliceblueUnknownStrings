import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomText from '../components/CustomText';
import { scale } from '../theme/scale';
import { playAnimation } from '../theme/animation';

export type DialogBoxData = { text: string } | null;

/** System message over a phone; its "Okay" button unlocks after five seconds. */
export default function DialogBox({ dialogBox, setDialogBox }: { dialogBox: DialogBoxData; setDialogBox: (d: DialogBoxData) => void }) {
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    playAnimation(fadeAnim, 1, 400);
    const unlock = setTimeout(() => setLocked(false), 5000);
    return () => clearTimeout(unlock);
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.parentLayout, { opacity: fadeAnim }]}>
      <View style={styles.box}>
        <CustomText text={dialogBox?.text} color="#FFFFFFDD" />
        <CustomButton disabled={locked} style={styles.button} onPress={() => setDialogBox(null)}>
          <CustomText text="Okay" color="#FFFFFFDD" />
        </CustomButton>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0e0e0eAA' },
  box: {
    width: '90%',
    paddingHorizontal: '6%',
    paddingVertical: '4%',
    backgroundColor: '#232337',
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '50%',
    paddingVertical: '2%',
    marginTop: '4%',
    backgroundColor: '#FFFFFF11',
    borderRadius: scale(100),
    alignItems: 'center',
  },
});
