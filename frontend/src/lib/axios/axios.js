
import axios from "axios";

import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "./token-store";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

// Prevent multiple simultaneous refresh requests
let refreshPromise = null;

// Attach Access Token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle expired Access Token
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Do not refresh for authentication endpoints
    const excludedEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/setup",
      "/auth/refresh",
      "/auth/logout",
    ];

    const isExcluded = excludedEndpoints.some((endpoint) =>
      originalRequest.url?.includes(endpoint)
    );

    if (isExcluded || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Reuse an ongoing refresh request if one exists
      if (!refreshPromise) {
        refreshPromise = axiosInstance
          .post("/auth/refresh")
          .then((response) => {
            const newAccessToken =
              response.data.data.accessToken;

            setAccessToken(newAccessToken);

            return newAccessToken;
          })
          .catch((refreshError) => {
            clearAccessToken();
            throw refreshError;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      // Retry original request with new Access Token
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      clearAccessToken();

      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
