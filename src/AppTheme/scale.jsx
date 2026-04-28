import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

// Width-based sizes
const scale = (size) => (width / guidelineBaseWidth) * size;

//Height-based sizes
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

//Smoothed UI adjustments
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

//Font sizes
const normalizeFont = (size) => {
  const newSize = scale(size);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export { scale, verticalScale, moderateScale, normalizeFont };
