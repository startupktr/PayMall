import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api, { setAccessToken } from "@/api/axios";

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔑 RESTORE SESSION ON RELOAD
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1️⃣ refresh access token from HttpOnly cookie
        const res = await api.post("/users/token/refresh/");
        setAccessToken(res.data.access);

        // 2️⃣ fetch user profile
        const profile = await api.get("/users/profile/");
        setUser(profile.data);
      } catch {
        // 🔵 normal when user is not logged in
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ✅ LOGIN (UNCHANGED LOGIC)
  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/users/token/", { email, password });
      setAccessToken(res.data.access);
      setUser(res.data.user);
      return true;
    } catch {
      return false;
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      await api.post("/users/logout/");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
