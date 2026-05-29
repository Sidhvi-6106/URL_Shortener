import User from "../models/User.js";
import { verifyToken } from "../config/jwt.js";

const getUserFromToken = async (token) => {
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded?.userId) return null;

  return User.findById(decoded.userId).select("-password");
};

export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const user = await getUserFromToken(req.cookies.token);
    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

const authMiddleware = async (req, res, next) => {
  try {
    const user = await getUserFromToken(req.cookies.token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === "TokenExpiredError" ? "Session expired" : "Invalid token",
    });
  }
};

export default authMiddleware;
