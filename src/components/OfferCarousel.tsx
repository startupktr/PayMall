import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
} from "react-native";
import { Offer } from "@/types/offer";
import { useTheme } from "@/contexts/ThemeContext";

type Props = {
  offers: Offer[];
  onPress: (mallId: any) => void;
};

export default function OfferCarousel({
  offers,
  onPress,
}: Props) {
  const { theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const { width } = useWindowDimensions();

  const SIDE_GAP = theme.spacing.md; // 16
  const slideWidth = width;
  const bannerWidth = slideWidth - SIDE_GAP * 2;
  const bannerHeight = Math.round(bannerWidth / 2);

  const loopData = useMemo(() => {
    if (offers.length <= 1) return offers;
    return [offers[offers.length - 1], ...offers, offers[0]];
  }, [offers]);

  const [index, setIndex] = useState(
    offers.length > 1 ? 1 : 0
  );

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDraggingRef = useRef(false);
  const isReadyRef = useRef(false);

  const clearAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const safeScrollToIndex = useCallback(
    (i: number, animated: boolean) => {
      if (!flatListRef.current || !isReadyRef.current) return;
      flatListRef.current.scrollToIndex({
        index: i,
        animated,
      });
    },
    []
  );

  const startAutoPlay = useCallback(() => {
    if (offers.length <= 1) return;

    clearAutoPlay();

    timerRef.current = setInterval(() => {
      if (isDraggingRef.current) return;

      safeScrollToIndex(index + 1, true);
      setIndex((prev) => prev + 1);
    }, 3500);
  }, [index, offers.length]);

  useEffect(() => {
    startAutoPlay();
    return clearAutoPlay;
  }, [startAutoPlay]);

  useEffect(() => {
    if (offers.length > 1) {
      setIndex(1);
      setTimeout(() => safeScrollToIndex(1, false), 50);
    }
  }, [offers.length]);

  const onMomentumEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (offers.length <= 1) return;

    const currentIndex = Math.round(
      e.nativeEvent.contentOffset.x / slideWidth
    );

    setIndex(currentIndex);

    if (currentIndex === loopData.length - 1) {
      setTimeout(() => {
        safeScrollToIndex(1, false);
        setIndex(1);
      }, 30);
    }

    if (currentIndex === 0) {
      setTimeout(() => {
        safeScrollToIndex(offers.length, false);
        setIndex(offers.length);
      }, 30);
    }
  };

  const activeDot =
    offers.length <= 1
      ? 0
      : (index - 1 + offers.length) % offers.length;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={loopData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => `offer-${i}`}
        snapToInterval={slideWidth}
        decelerationRate="fast"
        getItemLayout={(_, i) => ({
          length: slideWidth,
          offset: slideWidth * i,
          index: i,
        })}
        onMomentumScrollEnd={onMomentumEnd}
        onLayout={() => {
          isReadyRef.current = true;
        }}
        renderItem={({ item }) => (
          <View style={{ width: slideWidth }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => onPress(item.mall_id)}
              style={[
                styles.banner,
                {
                  width: bannerWidth,
                  height: bannerHeight,
                  marginHorizontal: SIDE_GAP,
                  backgroundColor:
                    theme.colors.card,
                },
              ]}
            >
              <Image
                source={{ uri: item.image }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        )}
      />

      {offers.length > 1 && (
        <View style={styles.dots}>
          {offers.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === activeDot
                      ? theme.colors.primary
                      : theme.colors.border,
                  width: i === activeDot ? 10 : 6,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 18,
    overflow: "hidden",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
});
