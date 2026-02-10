import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Video from 'react-native-video';
import { SafeContainer } from '@/components/SafeContainer';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ONBOARDING_COMPLETED_KEY } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SplashScreen: React.FC<any> = ({ navigation }) => {
  const { theme } = useTheme();
  const { isLoggedIn, loading } = useAuth();

  const [videoFinished, setVideoFinished] = useState(false);
  const hasNavigated = useRef(false);
  const handleVideoLoad = (data: any) => {

    // Fallback timer based on real duration
    setTimeout(() => {
      setVideoFinished(true);
    }, data.duration * 1000);
  };

  const handleVideoEnd = () => {
    setVideoFinished(true);
  };
  useEffect(() => {
    if (!videoFinished) return;
    if (loading) return;

    handleNavigation();
  }, [videoFinished, loading]);

  const handleNavigation = async () => {
  if (hasNavigated.current) return;
  hasNavigated.current = true;

  const onboardingDone = await AsyncStorage.getItem(
    ONBOARDING_COMPLETED_KEY
  );

  requestAnimationFrame(() => {
    if (!onboardingDone) {
      navigation.replace("Onboarding");
      return;
    }

    if (isLoggedIn) {
      navigation.replace("Main");
    } else {
      navigation.replace("Auth");
    }
  });
};

  return (
    <SafeContainer edges={[]} style={{ backgroundColor: theme.colors.primary }}>
      <View style={styles.container}>
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
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          mixWithOthers="mix"
          disableFocus={true}
          onLoad={handleVideoLoad}
          onEnd={handleVideoEnd}
          onError={(e) => {
            console.log("Video error:", e);
            setVideoFinished(true);
          }}
        />
      </View>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fallback background color
  },
  video: StyleSheet.absoluteFill,
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
