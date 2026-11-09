
import { registerBusiness } from "./auth.service.js";

export const register = async (req, res) => {
  const result = await registerBusiness(req.body);

  return res.status(201).json({
    success: true,
    message: "Business registered successfully",
    data: result,
  });
};
