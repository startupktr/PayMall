import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

interface SafeContainerProps {
  children: ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  style?: ViewStyle;
}

export const SafeContainer: React.FC<SafeContainerProps> = ({
  children,
  edges = ['top', 'right', 'bottom', 'left'],
  style,
}) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
