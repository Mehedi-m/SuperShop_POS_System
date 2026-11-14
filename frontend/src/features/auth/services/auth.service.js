import axiosInstance from "@/lib/axios/axios";

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post(
    "/auth/login",
    credentials
  );

  return response.data.data;
};

export const setupBusiness = async (payload) => {
  const response = await axiosInstance.post("/auth/setup", payload);

  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axiosInstance.post(
    "/auth/register",
    userData
  );

  return response.data;
};