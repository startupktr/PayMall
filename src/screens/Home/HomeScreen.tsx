import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  Easing,
} from "react-native";
import Geolocation from "react-native-geolocation-service";
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from "react-native-permissions";
import api from "@/lib/axios";
import ScreenWrapper from "@/components/ScreenWrapper";
import HomeHeader from "@/components/HomeHeader";
import OfferCarousel from "@/components/OfferCarousel";
import MallCard from "@/components/MallCard";
import { useFocusEffect } from "@react-navigation/native";
import { useMall } from "@/contexts/MallContext";

/* ================= TYPES ================= */

type Mall = {
  id: string;
  name: string;
  address: string;
  image: string;
  description: string;
  distance: number;
};

const MIN_DISTANCE_TO_REFETCH_METERS = 200;

/* ================= HAVERSINE ================= */

const haversineMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

/* ================= SHIMMER ================= */

function ShimmerMallGrid({ isDark }: { isDark: boolean }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const base = isDark ? "#0F172A" : "#E6F4F1";
  const block = isDark ? "#111827" : "#CBD5E1";
  const highlight = isDark
    ? "rgba(255,255,255,0.10)"
    : "rgba(255,255,255,0.55)";

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-140, 260],
  });

  const SkeletonCard = () => (
    <View style={[styles.mallSkeletonCard, { backgroundColor: base }]}>
      <View style={[styles.mallSkeletonImage, { backgroundColor: block }]} />
      <View style={[styles.mallSkeletonTitle, { backgroundColor: block }]} />
      <View style={[styles.mallSkeletonTagline, { backgroundColor: block }]} />
      <View style={[styles.mallSkeletonDistance, { backgroundColor: block }]} />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.mallSkeletonShimmerOverlay,
          { transform: [{ translateX }], backgroundColor: highlight },
        ]}
      />
    </View>
  );

  return (
    <View style={styles.grid}>
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={styles.gridItem}>
          <SkeletonCard />
        </View>
      ))}
    </View>
  );
}

/* ================= SCREEN ================= */

export default function HomeScreen({ navigation }: any) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const { setSelectedMall } = useMall();

  const [malls, setMalls] = useState<Mall[]>([]);
  const [filteredMalls, setFilteredMalls] = useState<Mall[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [mallsLoading, setMallsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [locationDenied, setLocationDenied] = useState(false);
  const [locationBlocked, setLocationBlocked] = useState(false);

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [showAllMalls, setShowAllMalls] = useState(false);

  const [formatted, setFormatted] = useState<string | null>(null);
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const showMallSkeleton =
    !hasLoadedOnce && (mallsLoading || malls.length === 0);

  useFocusEffect(
    useCallback(() => {
      setSelectedMall(null);
    }, [])
  );

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    fetchOffers();
    await requestLocationAndFetch();
  };

  /* ================= PERMISSION ================= */

  const requestLocationAndFetch = async (isPull = false) => {
    if (isPull) setRefreshing(true);
    // setLocationDenied(false);
    // setLocationBlocked(false);

    const permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    let status = await check(permission);

    if (status === RESULTS.DENIED) {
      status = await request(permission);
    }

    if (status === RESULTS.GRANTED) {
      getCurrentLocation(isPull);
      return;
    }

    if (status === RESULTS.BLOCKED) {
      setLocationBlocked(true);
    } else {
      setLocationDenied(true);
    }

    setLoading(false);
    setRefreshing(false);
  };

  /* ================= LOCATION ================= */

  const getCurrentLocation = (isPull = false) => {
    Geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        maybeFetchMalls(latitude, longitude);
      },
      () => {
        Alert.alert("Location Error", "Unable to get location");
        setLoading(false);
        setRefreshing(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const maybeFetchMalls = (lat: number, lng: number) => {
    const last = lastCoordsRef.current;

    if (!last) {
      lastCoordsRef.current = { lat, lng };
      fetchMalls(lat, lng);
      return;
    }

    const moved = haversineMeters(last.lat, last.lng, lat, lng);

    if (moved >= MIN_DISTANCE_TO_REFETCH_METERS) {
      lastCoordsRef.current = { lat, lng };
      fetchMalls(lat, lng);
    } else {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ================= API ================= */

  const fetchMalls = async (lat: number, lng: number) => {
    try {
      setMallsLoading(true);

      const res = await api.get(
        `malls/nearby/?latitude=${lat}&longitude=${lng}`
      );

      const data = res.data.data || [];

      setMalls(data);
      setFilteredMalls(data);
      setHasLoadedOnce(true);

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    } catch {
      Alert.alert("Error", "Unable to fetch nearby malls");
    } finally {
      setMallsLoading(false);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await api.get("malls/offers/");
      setOffers(res.data.data || []);
    } catch { }
  };

  /* ================= SEARCH ================= */

  useEffect(() => {
    if (!search.trim()) {
      setFilteredMalls(malls);
      return;
    }

    const q = search.toLowerCase();
    setFilteredMalls(
      malls.filter((m) =>
        m.name.toLowerCase().includes(q)
      )
    );
  }, [search, malls]);

  /* ================= LOADING SCREEN ================= */

  // if (loading) {
  //   return (
  //     <ScreenWrapper>
  //       <View style={styles.center}>
  //         <ActivityIndicator size="large" color="#2563EB" />
  //         <Text style={{ marginTop: 12 }}>
  //           Finding nearby malls...
  //         </Text>
  //       </View>
  //     </ScreenWrapper>
  //   );
  // }

  /* ================= PERMISSION UI ================= */

  if (locationDenied || locationBlocked) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <Text style={styles.errorTitle}>
            Location Permission Required
          </Text>

          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              if (locationBlocked) {
                openSettings();
              } else {
                requestLocationAndFetch();
              }
            }}
          >
            <Text style={styles.retryText}>
              {locationBlocked
                ? "Open Settings"
                : "Allow Location"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  /* ================= MAIN UI (EXACT OLD STRUCTURE) ================= */

  return (
    // <ScreenWrapper scroll={false}>
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      accessible={false}
    >
      <KeyboardAvoidingView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#0B1220" : "#F1F5F9" },
        ]}
        behavior={
          Platform.OS === "ios" ? "padding" : "height"
        }
      >
        <HomeHeader
          showLocationBar={false}
          showLocationTextBelowLogo
          searchValue={search}
          onSearchChange={setSearch}
          locationTitle={formatted || ""}
          searchPlaceholder="Search nearby malls..."
        />

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={requestLocationAndFetch}
            />
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {offers.length > 0 && (
            <View
              style={{
                marginHorizontal: -16,
                paddingTop: 10,
              }}
            >
              <OfferCarousel
                offers={offers}
                onPress={(mallId) =>
                  navigation.navigate("MallDetails", {
                    mallId,
                  })
                }
              />
            </View>
          )}

          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark
                  ? "#F8FAFC"
                  : "#020617",
              },
            ]}
          >
            Malls Nearby
          </Text>

          {showMallSkeleton ? (
            <ShimmerMallGrid isDark={isDark} />
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={styles.grid}>
                {filteredMalls
                  .slice(
                    0,
                    showAllMalls
                      ? filteredMalls.length
                      : 4
                  )
                  .map((mall) => (
                    <View
                      key={mall.id}
                      style={styles.gridItem}
                    >
                      <MallCard
                        name={mall.name}
                        image={mall.image}
                        tagline={mall.description}
                        distance={mall.distance}
                        onPress={() =>
                          navigation.navigate(
                            "MallDetails",
                            { mallId: mall.id }
                          )
                        }
                      />
                    </View>
                  ))}
              </View>

              {filteredMalls.length > 4 && (
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() =>
                    setShowAllMalls((p) => !p)
                  }
                >
                  <Text style={styles.viewAllText}>
                    {showAllMalls
                      ? "Show Less"
                      : "View All"}
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
    // </ScreenWrapper>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  content: { paddingHorizontal: 16 },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingText: { marginTop: 12, color: "#475569" },

  errorTitle: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  errorText: { textAlign: "center", color: "#64748B", marginBottom: 20 },

  retryBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontWeight: "600" },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#020617",
    marginTop: 10,
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: { width: "48%" },

  viewAllBtn: { marginTop: 10, alignSelf: "center" },
  viewAllText: { fontSize: 14, color: "#2563EB", fontWeight: "700" },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#94A3B8",
  },

  /* ✅ shimmer skeleton card */
  skelCard: {
    width: "100%",
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    overflow: "hidden",
  },
  skelImage: {
    width: "100%",
    height: 110,
    borderRadius: 14,
  },
  skelLineLg: {
    height: 12,
    borderRadius: 6,
    marginTop: 12,
    width: "90%",
  },
  skelLineSm: {
    height: 10,
    borderRadius: 6,
    marginTop: 8,
    width: "60%",
  },

  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: 80,
    opacity: 0.8,
    borderRadius: 16,
  },
  /* ✅ MallCard matched skeleton */
  mallSkeletonCard: {
    width: "100%",
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  mallSkeletonImage: {
    width: "100%",
    height: 110,
    borderRadius: 14,
  },

  mallSkeletonTitle: {
    height: 14,
    borderRadius: 7,
    marginTop: 10,
    width: "90%",
  },

  mallSkeletonTagline: {
    height: 11,
    borderRadius: 7,
    marginTop: 8,
    width: "70%",
  },

  mallSkeletonDistance: {
    height: 12,
    borderRadius: 7,
    marginTop: 10,
    width: "45%",
  },

  mallSkeletonShimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: 90,
    opacity: 0.85,
    borderRadius: 18,
  },

});