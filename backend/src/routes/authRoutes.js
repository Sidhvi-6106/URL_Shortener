import express from "express";
import {
  authLimiter,
} from "../middleware/rateLimiter.js";
import {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
} from "../controllers/authController.js";

import authMiddleware, { optionalAuthMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", authLimiter, signup);

router.post(
  "/login",
  authLimiter,
  login
);

router.post("/logout", logout);

router.get("/me", optionalAuthMiddleware, getMe);
router.patch("/profile", authMiddleware, updateProfile);

export default router;
