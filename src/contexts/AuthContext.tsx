import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as Keychain from "react-native-keychain";

import api from "@/lib/axios";
import { useCart } from "@/contexts/CartContext";
import { postLoginRedirect } from "@/lib/postLoginRedirect";
import {
  safeNavigate,
  waitForNavigationReady,
} from "@/navigation/navigationRef";

/* ================= TYPES ================= */

type User = any; // you can type later

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;

  login: (email: string, password: string) => Promise<User>;
  register: (
    phone_number: number,
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

  const { mergeGuestCartIntoServer, fetchCart } =
    useCart();

  useEffect(() => {
    restoreSession();
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
    const res: any = await api.post(
      "accounts/login/",
      { email, password }
    );

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || "Login failed");
    }

    const { access, refresh, user } = res.data.data;

    if (!access || !refresh) {
      throw new Error("Invalid token response from server");
    }
    await Keychain.setGenericPassword(
      "auth",
      access
    );

    await Keychain.setInternetCredentials(
      "refresh",
      "auth",
      refresh
    );

    setUser(user);

    // merge cart if needed
    try {
      const redirect = await postLoginRedirect.get();
      if (redirect?.type === "CART_CHECKOUT") {
        await mergeGuestCartIntoServer();
      }
    } catch { }

    await waitForNavigationReady(2000);
    safeNavigate("Main");

    return user;
  };

  /* ================= REGISTER ================= */

  const register = async (
    phone_number: number,
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

    await Keychain.setGenericPassword(
      "auth",
      res.data.access
    );

    await Keychain.setInternetCredentials(
      "refresh",
      "auth",
      res.data.refresh
    );

    setUser(res.data.user);

    try {
      const redirect = await postLoginRedirect.get();
      if (redirect?.type === "CART_CHECKOUT") {
        await mergeGuestCartIntoServer();
        await fetchCart();
      }
    } catch { }

    await waitForNavigationReady(2000);
    safeNavigate("Main");

    return res.data.user;
  };

  /* ================= LOGOUT ================= */

  const logout = async () => {
    try {
      const refreshCreds = await Keychain.getInternetCredentials("refresh");

      if (refreshCreds && typeof refreshCreds === "object") {
        try {
          await api.post("accounts/logout/", {
            refresh: refreshCreds.password,
          });
        } catch {
          // ignore server logout failure
        }
      }
    } finally {
      await Keychain.resetGenericPassword();
      await Keychain.resetInternetCredentials({ server: "refresh" });
      setUser(null);

      await waitForNavigationReady(2000);
      safeNavigate("Main");
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
