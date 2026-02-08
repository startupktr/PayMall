import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

const { width, height } = Dimensions.get('window');

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const isSmallDevice = dimensions.width < 375;
  const isTablet = dimensions.width >= 768;
  const isLandscape = dimensions.width > dimensions.height;

  const wp = (percentage: number) => (dimensions.width * percentage) / 100;
  const hp = (percentage: number) => (dimensions.height * percentage) / 100;

  const scale = (size: number) => {
    const baseWidth = 375;
    return (dimensions.width / baseWidth) * size;
  };

  return {
    width: dimensions.width,
    height: dimensions.height,
    isSmallDevice,
    isTablet,
    isLandscape,
    wp,
    hp,
    scale,
  };
};
