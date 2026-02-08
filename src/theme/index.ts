import { lightColors, darkColors, ThemeColors } from './colors';
import { spacing, borderRadius, fontSize, fontWeight, lineHeight, iconSize } from './spacing';

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  lineHeight: typeof lineHeight;
  iconSize: typeof iconSize;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  lineHeight,
  iconSize,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  lineHeight,
  iconSize,
  isDark: true,
};
