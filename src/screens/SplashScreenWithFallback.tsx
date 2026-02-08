import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, Animated, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import { SafeContainer } from '@/components/SafeContainer';
import { useTheme } from '@/contexts/ThemeContext';
import { RootStackParamList } from '@/types/index';
import { ONBOARDING_COMPLETED_KEY, USER_TOKEN_KEY } from '@/constants/index';

const { width, height } = Dimensions.get('window');

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

/**
 * Advanced Splash Screen with Video + Animated Fallback
 * 
 * Features:
 * - Plays video if available
 * - Falls back to animated logo if video fails
 * - Auto-navigation after video/animation
 * - Error handling
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [videoEnded, setVideoEnded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const hasNavigated = useRef(false);
  
  // Animation values for fallback
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Fallback timer - maximum wait time
    const fallbackTimer = setTimeout(() => {
      if (!hasNavigated.current) {
        checkInitialRoute();
      }
    }, 5000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    // Start fallback animation if video is not available
    if (showFallback) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 10,
          friction: 2,
          useNativeDriver: true,
        }),
      ]).start();

      // Navigate after animation
      const timer = setTimeout(() => {
        checkInitialRoute();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showFallback]);

  useEffect(() => {
    if (videoEnded && !hasNavigated.current) {
      checkInitialRoute();
    }
  }, [videoEnded]);

  const checkInitialRoute = async () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    try {
      const [onboardingCompleted, userToken] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY),
        AsyncStorage.getItem(USER_TOKEN_KEY),
      ]);

      if (!onboardingCompleted) {
        navigation.replace('Onboarding');
      } else if (userToken) {
        navigation.replace('Main');
      } else {
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Error checking initial route:', error);
      navigation.replace('Onboarding');
    }
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  const handleVideoError = (error: any) => {
    console.error('Video error:', error);
    // Switch to fallback animation
    setShowFallback(true);
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
  };

  // Render fallback animated logo
  const renderFallbackAnimation = () => (
    <Animated.View
      style={[
        styles.logoContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.logo,
          {
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius.xl,
          },
        ]}
      >
        <Text
          style={[
            styles.logoText,
            {
              color: theme.colors.primary,
              fontSize: theme.fontSize.xxxl,
              fontWeight: theme.fontWeight.bold,
            },
          ]}
        >
          MF
        </Text>
      </View>
      
      <Animated.Text
        style={[
          styles.appName,
          {
            color: theme.colors.white,
            fontSize: theme.fontSize.xxl,
            fontWeight: theme.fontWeight.bold,
            marginTop: theme.spacing.lg,
          },
        ]}
      >
        Mall Finder
      </Animated.Text>
      
      <Animated.Text
        style={[
          styles.tagline,
          {
            color: theme.colors.white,
            fontSize: theme.fontSize.md,
            marginTop: theme.spacing.sm,
            opacity: 0.9,
          },
        ]}
      >
        Discover shopping destinations near you
      </Animated.Text>
    </Animated.View>
  );

  return (
    <SafeContainer edges={[]} style={{ backgroundColor: theme.colors.primary }}>
      <View style={styles.container}>
        {showFallback ? (
          // Show animated fallback if video fails
          renderFallbackAnimation()
        ) : (
          // Show video
          <>
            <Video
              source={
                Platform.OS === 'android'
                  ? { uri: 'asset:/splash_video.mp4' }
                  : require('../assets/videos/splash_video.mp4')
              }
              style={styles.video}
              resizeMode="cover"
              repeat={false}
              paused={false}
              onEnd={handleVideoEnd}
              onError={handleVideoError}
              onLoad={handleVideoLoad}
              playInBackground={false}
              playWhenInactive={false}
              ignoreSilentSwitch="ignore"
              muted={false}
              volume={1.0}
              rate={1.0}
            />

            {/* Optional overlay */}
            <View style={styles.overlay} />
          </>
        )}
      </View>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  // Fallback animation styles
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    textAlign: 'center',
  },
  appName: {
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
