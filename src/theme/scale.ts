import { Dimensions } from 'react-native';

// Size helpers tuned to the reference build's 380x680 design guideline.
const { width, height } = Dimensions.get('screen');

const guidelineBaseWidth = 380;
const guidelineBaseHeight = 680;

const screenWidth = width > 0 ? width : guidelineBaseWidth;
const screenHeight = height > 0 ? height : guidelineBaseHeight;

/** Tablets (and other wide screens) have a height/width ratio below 1.6. */
export const isTablet = screenHeight / screenWidth < 1.6;

export const scale = (size: number) => (screenWidth / guidelineBaseWidth) * size;

export const verticalScale = (size: number) => (screenHeight / guidelineBaseHeight) * size;

export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;
