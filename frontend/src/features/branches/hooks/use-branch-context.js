"use client";

import { useContext } from "react";
import BranchContext from "@/features/branches/context/branch-context";

const useBranchContext = () => {
  const context = useContext(BranchContext);

  if (!context) {
    throw new Error(
      "useBranchContext must be used within BranchProvider"
    );
  }

  return context;
};

export default useBranchContext;