import axiosInstance from "@/lib/axios/axios";

// Get counters by branch
export const getCountersByBranch = async (branchId) => {
  const response = await axiosInstance.get(
    `/counters/branch/${branchId}`
  );

  return response.data.data;
};

// Create counter
export const createCounter = async (branchId, payload) => {
  const response = await axiosInstance.post(
    `/counters/branch/${branchId}`,
    payload
  );

  return response.data.data;
};

// Update counter
export const updateCounter = async (counterId, payload) => {
  const response = await axiosInstance.patch(
    `/counters/${counterId}`,
    payload
  );

  return response.data.data;
};

// Toggle counter status
export const toggleCounterStatus = async (counterId) => {
  const response = await axiosInstance.patch(
    `/counters/${counterId}/status`
  );

  return response.data.data;
};