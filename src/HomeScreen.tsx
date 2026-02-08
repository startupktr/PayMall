import React, { useEffect, useState } from "react";
import { Text, RefreshControl } from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

export default function HomeScreen() {
  const [locationAllowed, setAllowed] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((res) => {
      setAllowed(res === RESULTS.GRANTED);
    });
  }, []);

  return (
    <ScreenWrapper
      scroll
      // refreshControl={
      //   <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />
      // }
    >
      {locationAllowed === false && (
        <Text style={{ color: "red" }}>
          Enable location to see nearby malls
        </Text>
      )}

      <Text>Home Page Content</Text>
    </ScreenWrapper>
  );
}
