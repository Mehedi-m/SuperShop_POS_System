import axiosInstance from "@/lib/axios/axios";

// Branches available to the currently authenticated user.
export const getAccessibleBranches = async () => {
  const response = await axiosInstance.get("/branches/accessible");
  return response.data.data.branches;
};

// Admin-only branch management APIs.
export const getAllBranches = async () => {
  const response = await axiosInstance.get("/branches");
  return response.data.data;
};

export const createBranch = async (payload) => {
  const response = await axiosInstance.post("/branches", payload);
  return response.data.data;
};

export const updateBranch = async ({ branchId, payload }) => {
  const response = await axiosInstance.patch(
    `/branches/${branchId}`,
    payload
  );
  return response.data.data;
};

export const toggleBranchStatus = async (branchId) => {
  const response = await axiosInstance.patch(
    `/branches/${branchId}/status`
  );
  return response.data.data;
};
