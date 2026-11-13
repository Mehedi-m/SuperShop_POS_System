
import { ROLE_PERMISSIONS } from "../constants/permissions.js";

const authorizePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];

    // Admin has full access
    if (userPermissions.includes("*")) {
      return next();
    }

    const hasPermission = requiredPermissions.every(
      (permission) => userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

export default authorizePermissions;
