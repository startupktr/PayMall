import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeContainer } from '@/components/SafeContainer';
import { Button } from '@/components/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { RootStackParamList, OnboardingSlide } from '@/types/index';
import { ONBOARDING_COMPLETED_KEY } from '@/constants/index';

const { width } = Dimensions.get('window');

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Enable Location & Choose a Mall',
    description: 'Turn on location access and pick the mall you’re shopping in. This helps us show nearby malls and accurate offers.',
    image: '🏬',
  },
  {
    id: '2',
    title: 'Scan Products Instantly',
    description: 'Scan the barcode on any product to instantly view price, details, and offers — no searching required.',
    image: '🗺️',
  },
  {
    id: '3',
    title: 'Pay in-App & Skip the Queue',
    description: 'Checkout directly from the app and avoid billing counters completely. Scan • Pay • Go.',
    image: '⭐',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { isTablet } = useResponsive();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.slideContent}>
          <Text style={styles.emoji}>{item.image}</Text>
          
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontSize: isTablet ? theme.fontSize.xxxl : theme.fontSize.xxl,
                fontWeight: theme.fontWeight.bold,
                marginTop: theme.spacing.xl,
              },
            ]}
          >
            {item.title}
          </Text>
          
          <Text
            style={[
              styles.description,
              {
                color: theme.colors.textSecondary,
                fontSize: isTablet ? theme.fontSize.lg : theme.fontSize.md,
                marginTop: theme.spacing.md,
                paddingHorizontal: theme.spacing.xl,
              },
            ]}
          >
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={[styles.pagination, { marginBottom: theme.spacing.xl }]}>
        {slides.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 24, 10],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index.toString()}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  backgroundColor: theme.colors.primary,
                  opacity,
                  marginHorizontal: theme.spacing.xs / 2,
                  borderRadius: theme.borderRadius.sm,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeContainer>
      <View style={styles.container}>
        {/* Skip Button */}
        <TouchableOpacity
          onPress={handleSkip}
          style={[styles.skipButton, { padding: theme.spacing.md }]}
        >
          <Text
            style={[
              styles.skipText,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.medium,
              },
            ]}
          >
            Skip
          </Text>
        </TouchableOpacity>

        {/* Slides */}
        <FlatList
          data={slides}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />

        {/* Pagination */}
        {renderPagination()}

        {/* Next/Get Started Button */}
        <View style={[styles.buttonContainer, { padding: theme.spacing.lg }]}>
          <Button
            title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            fullWidth
          />
        </View>
      </View>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  skipText: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 120,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 10,
  },
  buttonContainer: {
    paddingBottom: 0,
  },
});
