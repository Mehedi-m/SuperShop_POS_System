
import {
  getEmployees,
  getEmployeeById,
} from "../services/user.service.js";

export const getAllEmployees = async (req, res) => {
  const result = await getEmployees(req.user, req.query);

  return res.status(200).json({
    success: true,
    message: "Employees retrieved successfully",
    data: result,
  });
};

export const getSingleEmployee = async (req, res) => {
  const employee = await getEmployeeById(
    req.params.userId,
    req.user
  );

  return res.status(200).json({
    success: true,
    message: "Employee retrieved successfully",
    data: employee,
  });
};
