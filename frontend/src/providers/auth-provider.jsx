
"use client";

import {
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";

import AuthContext from "@/features/auth/context/auth-context";
import { loginUser } from "@/features/auth/services/auth.service";

import axiosInstance from "@/lib/axios/axios";

import {
  setAccessToken,
  clearAccessToken,
} from "@/lib/axios/token-store";

// Prevent duplicate session restoration requests
// during React Strict Mode effect re-runs.
let sessionRestorePromise = null;

const restoreSession = () => {
  if (!sessionRestorePromise) {
    sessionRestorePromise = axiosInstance
      .post("/auth/refresh")
      .then((response) => response.data.data)
      .finally(() => {
        sessionRestorePromise = null;
      });
  }

  return sessionRestorePromise;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Restore session when application loads
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const data = await restoreSession();

        if (isMounted) {
          setAccessToken(data.accessToken);
          setUser(data.user);
        }
      } catch (error) {
        clearAccessToken();

        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login
  const login = useCallback(async (credentials) => {
    setIsLoading(true);

    try {
      const data = await loginUser(credentials);

      setAccessToken(data.accessToken);
      setUser(data.user);

      return data.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isInitialized,
      login,
      logout,
    }),
    [
      user,
      isLoading,
      isInitialized,
      login,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
