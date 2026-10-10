import React from 'react';
import {
  DimensionValue,
  Image,
  ImageResizeMode,
  ImageSourcePropType,
  ImageStyle,
  LayoutChangeEvent,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

export type CustomImageProps = {
  source: ImageSourcePropType | string | null | undefined;
  width?: DimensionValue;
  height?: DimensionValue;
  aspectRatio?: number;
  round?: boolean;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  tint?: string;
  resizeMode?: ImageResizeMode;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
  onPress?: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
};

const isBase64Image = (src: unknown): src is string =>
  typeof src === 'string' && src.startsWith('data:image');

/**
 * Image wrapper used everywhere in the game. The reference build rendered through
 * FastImage, which shows images immediately; `fadeDuration={0}` keeps the stock
 * Android Image from cross-fading so pictures pop in exactly the same way.
 */
export default function CustomImage(props: CustomImageProps) {
  const source = isBase64Image(props.source)
    ? { uri: props.source }
    : typeof props.source === 'string'
      ? { uri: props.source }
      : props.source;

  return (
    <View
      onTouchEnd={props.onPress}
      style={[
        {
          width: props.width,
          height: props.height,
          aspectRatio: props.aspectRatio,
          borderRadius: props.round ? 200 : 0,
          overflow: 'hidden',
        },
        props.style || {},
      ]}
      pointerEvents={props.pointerEvents || 'auto'}
      onLayout={props.onLayout}>
      {source ? (
        <Image
          source={source as ImageSourcePropType}
          fadeDuration={0}
          style={[{ width: '100%', height: '100%', tintColor: props.tint }, props.imageStyle || {}]}
          resizeMode={props.resizeMode || 'cover'}
        />
      ) : null}
    </View>
  );
}
