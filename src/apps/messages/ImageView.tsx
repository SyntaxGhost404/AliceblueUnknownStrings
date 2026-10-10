import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import { playAnimation } from '../../theme/animation';
import { ImageViewData } from './MessageImage';

/** Full-screen photo viewer; tap outside the photo to close. */
export default function ImageView({ data, setImageView }: { data: ImageViewData; setImageView: (d: ImageViewData | null) => void }) {
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    playAnimation(fade, 1, 200);
  }, [fade]);

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      <CustomButton
        style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
        activeOpacity={1}
        onPress={() => {
          playAnimation(fade, 0, 200);
          setTimeout(() => setImageView(null), 200);
        }}>
        <View style={{ width: '90%', aspectRatio: data.image.aspectRatio }} onStartShouldSetResponder={() => true}>
          <CustomImage source={data.image.source} width="100%" height="100%" resizeMode="contain" />
        </View>
      </CustomButton>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, backgroundColor: '#000000CC', zIndex: 20 },
});
