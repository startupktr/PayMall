import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import * as Keychain from "react-native-keychain";
import { authEvents } from "@/lib/authEvents";

/* ================================
   CONFIG
================================ */

const API_URL = "https://api.paymall.live";

export interface ApiEnvelope<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors: any;
}

export interface ExtendedRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _silentAuth?: boolean;
}

/* ================================
   AXIOS INSTANCE
================================ */

const api = axios.create({
  baseURL: `${API_URL}/api/`,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================================
   ENVELOPE NORMALIZER
================================ */

function normalizeEnvelope(payload: any): ApiEnvelope {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return {
      success: Boolean(payload.success),
      message: payload.message ?? "",
      data: payload.data ?? null,
      errors: payload.errors ?? null,
    };
  }

  return {
    success: true,
    message: "",
    data: payload ?? null,
    errors: null,
  };
}

/* ================================
   REQUEST INTERCEPTOR
================================ */

api.interceptors.request.use(async (config) => {
  const accessCreds = await Keychain.getGenericPassword();

  if (accessCreds) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessCreds.password}`;
  }

  return config;
});

/* ================================
   TOKEN REFRESH LOGIC
================================ */

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((p) =>
    error ? p.reject(error) : p.resolve(token!)
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => {
    response.data = normalizeEnvelope(response.data);
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedRequestConfig;

    if (!error.response) {
      return Promise.reject(error);
    }

    /* Skip silent auth check */
    if (error.response.status === 401 && originalRequest?._silentAuth) {
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      originalRequest?.url?.includes("accounts/login") ||
      originalRequest?.url?.includes("accounts/signup") ||
      originalRequest?.url?.includes("accounts/token/refresh");

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          };
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      const refreshCreds =
        await Keychain.getInternetCredentials("refresh");

      if (!refreshCreds) {
        await Keychain.resetGenericPassword();
        await Keychain.resetInternetCredentials({ server: "refresh" });

        authEvents.emitAuthRequired({
          reason: "missing_refresh_token",
        });

        processQueue(error, null);
        isRefreshing = false;

        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${API_URL}/api/accounts/token/refresh/`,
          {
            refresh: refreshCreds.password,
          }
        );

        const newAccessToken = res.data.access;

        await Keychain.setGenericPassword(
          "auth",
          newAccessToken
        );

        processQueue(null, newAccessToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        return api(originalRequest);
      } catch (refreshError) {
        await Keychain.resetGenericPassword();
        await Keychain.resetInternetCredentials({
          server: "refresh",
        });

        authEvents.emitAuthRequired({
          reason: "refresh_failed",
        });

        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
