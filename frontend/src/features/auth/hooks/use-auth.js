"use client";

import { useContext } from "react";
import AuthContext from "@/features/auth/context/auth-context";

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
};

export default useAuth;