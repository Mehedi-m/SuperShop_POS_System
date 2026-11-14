import axiosInstance from "@/lib/axios/axios";

// Get pending users
export const getPendingUsers = async () => {
  const response = await axiosInstance.get(
    "/auth/pending-users"
  );

  return response.data.data;
};

// Get all branches (Admin only)
export const getAllBranches = async () => {
  const response = await axiosInstance.get("/branches");

  return response.data.data;
};

// Get counters by branch
export const getCountersByBranch = async (branchId) => {
  const response = await axiosInstance.get(
    `/counters/branch/${branchId}`
  );

  return response.data.data;
};

// Approve user
export const approveUser = async ({
  userId,
  role,
  branchId,
  counterId,
}) => {
  const response = await axiosInstance.patch(
    `/auth/approve/${userId}`,
    {
      role,

      ...(
        ["manager", "inventory_manager"].includes(role) && {
          branchId,
        }
      ),

      ...(role === "cashier" && { counterId }),
    }
  );

  return response.data.data;
};

// Reject user
export const rejectUser = async (userId) => {
  const response = await axiosInstance.patch(
    `/auth/reject/${userId}`
  );

  return response.data.data;
};