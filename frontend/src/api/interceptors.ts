import api from "./axios";

let isRefreshing = false;
let queue: (() => void)[] = [];

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // 🚨 Ignore refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/users/token/refresh")
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          await api.post("/users/token/refresh/");
          isRefreshing = false;

          queue.forEach(cb => cb());
          queue = [];

          return api(originalRequest);
        } catch {
          isRefreshing = false;
          queue = [];
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }

      return new Promise(resolve => {
        queue.push(() => resolve(api(originalRequest)));
      });
    }

    return Promise.reject(error);
  }
);
