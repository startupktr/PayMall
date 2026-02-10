import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { postLoginRedirect } from "@/lib/postLoginRedirect";

export default function RequireAuth({ children }: any) {
  const { isLoggedIn } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute();

  useEffect(() => {
    if (!isLoggedIn) {
      postLoginRedirect.set({
        type: "GO_TO",
        payload: {
          screen: "Main",
          params: {
            screen: route.name,
            params: route.params,
          },
        },
      });

      navigation.navigate("Auth");
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  return children;
}
