import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "paymall_onboarding_completed_v1";

export const useAppBootstrap = () => {
  const [loading, setLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY);
      setIsFirstLaunch(!onboardingDone);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    isFirstLaunch,
  };
};

export const markOnboardingComplete = async () => {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
};
