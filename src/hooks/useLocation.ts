import { useState, useEffect } from "react";
import { Platform, Alert } from "react-native";
import Geolocation from "react-native-geolocation-service";
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from "react-native-permissions";

export type Location = {
  latitude: number;
  longitude: number;
};

type PermissionState =
  | "loading"
  | "granted"
  | "denied"
  | "blocked"
  | "gps_off";

export const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [permissionState, setPermissionState] =
    useState<PermissionState>("loading");
  const [isFetching, setIsFetching] = useState(false);

  const permission = Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  });

  /* ===============================
     INITIAL CHECK
  =============================== */

  useEffect(() => {
    initPermission();
  }, []);

  const initPermission = async () => {
    if (!permission) return;

    try {
      const status = await check(permission);

      if (status === RESULTS.GRANTED) {
        setPermissionState("granted");
        fetchLocation();
        return;
      }

      if (status === RESULTS.BLOCKED) {
        setPermissionState("blocked");
        return;
      }

      // First launch or denied → auto request
      const requestResult = await request(permission);

      if (requestResult === RESULTS.GRANTED) {
        setPermissionState("granted");
        fetchLocation();
      } else if (requestResult === RESULTS.BLOCKED) {
        setPermissionState("blocked");
      } else {
        setPermissionState("denied");
      }
    } catch (e) {
      console.log("Permission error:", e);
      setPermissionState("denied");
    }
  };

  /* ===============================
     LOCATION FETCH
  =============================== */

  const fetchLocation = () => {
    setIsFetching(true);

    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsFetching(false);
      },
      (error) => {
        setIsFetching(false);

        if (error.code === 2) {
          // POSITION_UNAVAILABLE
          setPermissionState("gps_off");
        } else {
          Alert.alert("Location Error", error.message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        forceRequestLocation: true,
      }
    );
  };

  const retryPermission = () => {
    initPermission();
  };

  const openAppSettings = () => {
    openSettings().catch(() =>
      Alert.alert("Unable to open settings")
    );
  };

  return {
    location,
    permissionState,
    isFetching,
    retryPermission,
    fetchLocation,
    openAppSettings,
  };
};
