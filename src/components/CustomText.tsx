import React from 'react';
import { StyleProp, Text, TextLayoutEvent, TextStyle } from 'react-native';
import theme, { FontSizeVariant } from '../theme/theme';
import { isTablet, scale } from '../theme/scale';

export type CustomTextProps = {
  text?: React.ReactNode;
  children?: React.ReactNode;
  variant?: FontSizeVariant;
  color?: string;
  // Colour shortcuts (first match wins, in this order).
  timeline?: boolean;
  accent?: boolean;
  error?: boolean;
  white?: boolean;
  gray?: boolean;
  // Font shortcuts.
  mono?: boolean;
  bold?: boolean;
  gameText?: boolean;
  heading?: boolean;
  handwritten?: boolean;
  underline?: boolean;
  noDefaultMargin?: boolean;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  adjustsFontSizeToFit?: boolean;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  numberOfLines?: number;
  onPress?: () => void;
  onTextLayout?: (e: TextLayoutEvent) => void;
};

const defaultSize = isTablet ? theme.fontSizes.caption : theme.fontSizes.text;

function resolveColor(p: CustomTextProps) {
  if (p.color) return p.color;
  if (p.timeline) return theme.colors.blueChalk;
  if (p.accent) return theme.colors.accent;
  if (p.error) return theme.colors.red;
  if (p.white) return theme.colors.white;
  if (p.gray) return theme.colors.mediumGray;
  return theme.colors.black;
}

function resolveFontFamily(p: CustomTextProps) {
  if (p.mono) return 'monospace';
  if (p.bold) {
    if (p.gameText) return 'JosefinSans-Bold';
    return p.handwritten ? 'Caveat-Bold' : 'Quicksand-SemiBold';
  }
  if (p.gameText || p.heading) return 'JosefinSans-Regular';
  if (p.timeline) return 'Aldenburg';
  if (p.handwritten) return 'Caveat-Regular';
  return theme.fontFamily;
}

/** The game's single text primitive: every label goes through this component. */
export default function CustomText(props: CustomTextProps) {
  const variant = props.variant || 'text';
  let size: number = theme.fontSizes[variant];
  if (isTablet) size -= 4;

  return (
    <Text
      onTextLayout={props.onTextLayout}
      style={[
        {
          color: resolveColor(props),
          fontSize: Math.max(1, scale(size || defaultSize)),
          fontFamily: resolveFontFamily(props),
          textDecorationLine: props.underline ? 'underline' : undefined,
          marginVertical: props.noDefaultMargin ? 0 : '2%',
          textAlign: props.center ? 'center' : 'left',
          letterSpacing: props.timeline ? scale(1) : scale(0.4),
        },
        props.style || {},
      ]}
      adjustsFontSizeToFit={props.adjustsFontSizeToFit || false}
      ellipsizeMode={props.ellipsizeMode || 'tail'}
      numberOfLines={props.numberOfLines || 0}
      onPress={props.onPress}>
      {props.text}
      {props.children}
    </Text>
  );
}
