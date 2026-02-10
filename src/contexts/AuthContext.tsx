import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as Keychain from "react-native-keychain";

import api from "@/lib/axios";
import { postLoginRedirect } from "@/lib/postLoginRedirect";
import { navigationRef } from "@/navigation/navigationRef";
import { authEvents } from "@/lib/authEvents";

/* ================= TYPES ================= */

type User = any; // you can type later

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;

  login: (email: string, password: string) => Promise<User>;
  register: (
    phone_number: string,
    email: string,
    password: string,
    password2: string
  ) => Promise<User>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

/* ================= PROVIDER ================= */

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
    const unsub = authEvents.onAuthRequired(async () => {
      await Keychain.resetGenericPassword();
      await Keychain.resetInternetCredentials({ server: "refresh" });
      setUser(null);
      authEvents.unlock();
    });

    return unsub;
  }, []);

  /* ================= RESTORE SESSION ================= */

  const restoreSession = async () => {
    try {
      const creds = await Keychain.getGenericPassword();

      if (!creds) {
        setUser(null);
        return;
      }

      const me: any = await api.get("accounts/me/", {
        _silentAuth: true,
      });

      setUser(me?.data ?? me);
    } catch {
      await Keychain.resetGenericPassword();
      await Keychain.resetInternetCredentials({ server: "refresh" });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* ================= REFRESH ME ================= */

  const refreshMe = async () => {
    try {
      const me: any = await api.get("accounts/me/", {
        _silentAuth: true,
      });
      setUser(me?.data ?? me);
    } catch { }
  };

  /* ================= LOGIN ================= */

  const login = async (email: string, password: string) => {
    const res: any = await api.post("accounts/login/", {
      email,
      password,
    });

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || "Login failed");
    }

    const { access, refresh, user } = res.data.data;

    await Keychain.setGenericPassword("auth", access);
    await Keychain.setInternetCredentials("refresh", "auth", refresh);

    setUser(user);

    const redirect = await postLoginRedirect.get();

    // 🔥 Close Auth Modal First
    if (navigationRef.current?.canGoBack()) {
      navigationRef.current.goBack();
    }

    setTimeout(async () => {
      if (redirect?.type === "GO_TO") {
        navigationRef.navigate(
          redirect.payload.screen,
          redirect.payload.params
        );
        await postLoginRedirect.clear();
      } else {
        navigationRef.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      }
    }, 120);

    return user;
  };

  /* ================= REGISTER ================= */

  const register = async (
    phone_number: string,
    email: string,
    password: string,
    password2: string
  ) => {
    const res: any = await api.post(
      "accounts/signup/customer/",
      {
        phone_number,
        email,
        password,
        password2,
      }
    );

    const { access, refresh, user } = res.data;

    await Keychain.setGenericPassword("auth", access);
    await Keychain.setInternetCredentials("refresh", "auth", refresh);

    setUser(user);

    const redirect = await postLoginRedirect.get();

    // 🔥 Close modal first (important)
    if (navigationRef.current?.canGoBack()) {
      navigationRef.current.goBack();
    }

    setTimeout(async () => {
      if (redirect?.type === "GO_TO") {
        navigationRef.navigate(
          redirect.payload.screen,
          redirect.payload.params
        );
        await postLoginRedirect.clear();
      } else {
        navigationRef.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      }
    }, 120);

    return user;
  };

  /* ================= LOGOUT ================= */

  const logout = async () => {
    try {
      const refreshCreds = await Keychain.getInternetCredentials("refresh");

      if (refreshCreds) {
        try {
          await api.post("accounts/logout/", {
            refresh: refreshCreds.password,
          });
        } catch { }
      }
    } finally {
      await Keychain.resetGenericPassword();
      await Keychain.resetInternetCredentials({ server: "refresh" });
      setUser(null);
      await postLoginRedirect.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loading,
        login,
        register,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>

  );
};

/* ================= HOOK ================= */

export const useAuth = () => useContext(AuthContext);
