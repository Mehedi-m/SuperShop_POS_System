"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import BranchContext from "@/features/branches/context/branch-context";
import useBranches from "@/features/branches/hooks/use-branches";

const BranchProvider = ({ children }) => {
  const {
    data: branches = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useBranches();

  const [selectedBranchId, setSelectedBranchId] = useState("");

  // Set Main Branch as default
  useEffect(() => {
    if (!branches.length) {
      setSelectedBranchId("");
      return;
    }

    const selectedBranchExists = branches.some(
      (branch) => branch._id === selectedBranchId
    );

    if (selectedBranchExists) return;

    const mainBranch = branches.find(
      (branch) => branch.isMain
    );

    setSelectedBranchId(
      (mainBranch || branches[0])._id
    );
  }, [branches, selectedBranchId]);

  const changeBranch = useCallback(
    (branchId) => {
      const branchExists = branches.some(
        (branch) => branch._id === branchId
      );

      if (branchExists) {
        setSelectedBranchId(branchId);
      }
    },
    [branches]
  );

  const selectedBranch = useMemo(
    () =>
      branches.find(
        (branch) => branch._id === selectedBranchId
      ) || null,
    [branches, selectedBranchId]
  );

  const value = useMemo(
    () => ({
      branches,
      selectedBranch,
      selectedBranchId,
      changeBranch,
      isLoading,
      isError,
      error,
      refetchBranches: refetch,
    }),
    [
      branches,
      selectedBranch,
      selectedBranchId,
      changeBranch,
      isLoading,
      isError,
      error,
      refetch,
    ]
  );

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
};

export default BranchProvider;