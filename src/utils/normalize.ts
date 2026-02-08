import { Dimensions, PixelRatio } from "react-native";

const { width } = Dimensions.get("window");
const scale = width / 375; // iPhone baseline

export function normalize(size: number) {
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
}
