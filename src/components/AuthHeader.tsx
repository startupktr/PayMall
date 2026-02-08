import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';

type AuthHeaderProps = {
  title: string;
  subtitle: string;
};

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
}) => {
  const { theme } = useTheme();
  const { isTablet } = useResponsive();

  return (
    <View style={styles.container}>
      <Image
        source={require('@/../assets/icons/logo.png')}
        style={[
          styles.logo,
          {
            width: isTablet ? 200 : 160,
            height: isTablet ? 200 : 160,
          },
        ]}
      />

      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text,
            fontSize: isTablet
              ? theme.fontSize.xxxl
              : theme.fontSize.xxl,
            fontWeight: theme.fontWeight.bold,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: theme.colors.textSecondary,
            fontSize: isTablet
              ? theme.fontSize.lg
              : theme.fontSize.md,
          },
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
  },
});
