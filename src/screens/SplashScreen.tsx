import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
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

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [videoEnded, setVideoEnded] = useState(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Fallback timer in case video doesn't load or is too short
    const fallbackTimer = setTimeout(() => {
      if (!hasNavigated.current) {
        checkInitialRoute();
      }
    }, 5000); // Maximum 5 seconds

    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    if (videoEnded && !hasNavigated.current) {
      checkInitialRoute();
    }
  }, [videoEnded]);

  const checkInitialRoute = async () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    try {
      const onboardingCompleted = await AsyncStorage.getItem(
        ONBOARDING_COMPLETED_KEY
      );

      if (!onboardingCompleted) {
        navigation.replace('Onboarding');
      } else {
        navigation.replace('Main');
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
    // Navigate immediately if video fails to load
    checkInitialRoute();
  };

  return (
    <SafeContainer edges={[]} style={{ backgroundColor: theme.colors.primary }}>
      <View style={styles.container}>
        {/* 
          Video Splash Screen
          Replace 'splash_video' with your actual video file
          
          To add your video:
          1. For Android: Place video in android/app/src/main/res/raw/splash_video.mp4
          2. For iOS: Add video to Xcode project in Resources folder
          3. Update the source path below
        */}
        <Video
          source={
            Platform.OS === 'android'
              ? require("@/../assets/videos/splash_video.mp4") // Android: assets or res/raw
              : require('../../assets/videos/splash_video.mp4') // iOS: require local file
          }
          style={styles.video}
          resizeMode="cover" // Options: 'contain', 'cover', 'stretch'
          repeat={false}
          paused={false}
          onEnd={handleVideoEnd}
          onError={handleVideoError}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          mixWithOthers="mix"
          disableFocus={true}
          // muted={true} // Set to true if you want silent video
          // volume={1.0}
          // rate={1.0}
        // Optional: Show loading indicator while video loads
        // onLoadStart={() => console.log('Video loading...')}
        // onLoad={() => console.log('Video loaded')}
        // onLoad={(d) => console.log('LOADED', d)}
        // onProgress={(p) => console.log('PROGRESS', p.currentTime)}
        // onError={(e) => console.log('ERROR', e)}
        />

        {/* Optional: Overlay gradient for better branding */}
        {/* <View style={styles.overlay} /> */}
      </View>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fallback background color
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
    backgroundColor: 'transparent', // Change to add overlay effect
    // Example gradient overlay:
    // backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
});
