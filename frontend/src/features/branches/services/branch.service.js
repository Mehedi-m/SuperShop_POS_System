import axiosInstance from "@/lib/axios/axios";

export const getAccessibleBranches = async () => {
  const response = await axiosInstance.get("/branches/accessible");

  return response.data.data.branches;
};
