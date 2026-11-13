import axiosInstance from "@/lib/axios/axios";

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post(
    "/auth/login",
    credentials
  );

  return response.data.data;
};