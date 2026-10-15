import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { FileX } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import { scale } from '../../theme/scale';
import { playAnimation } from '../../theme/animation';

const MESSAGE = 'Video playback error.\nFile stopped playing unexpectedly.';

type Props = {
  /** Dismisses the box; the Files screen then starts the recovery. */
  onClose: () => void;
};

/** Full-screen notice shown when a corrupted file is opened. */
export default function ErrorBox({ onClose }: Props) {
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    playAnimation(opacity, 1, 400);
  }, [opacity]);

  return (
    <Animated.View style={[styles.parentLayout, { opacity }]}>
      <View style={styles.box}>
        <FileX strokeWidth={scale(0.8)} size={scale(40)} color="#FFFFFFDD" />
        <CustomText center text={MESSAGE} color="#FFFFFFDD" />
        <CustomButton style={styles.button} onPress={onClose}>
          <CustomText text="Okay" color="#FFFFFFDD" />
        </CustomButton>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  parentLayout: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#05090DF9',
  },
  box: {
    width: '85%',
    paddingHorizontal: '6%',
    paddingVertical: '4%',
    backgroundColor: '#131A1F',
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
