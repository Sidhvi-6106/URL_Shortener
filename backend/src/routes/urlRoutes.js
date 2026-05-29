import express from "express";

import {
  optionalAuthMiddleware,
} from "../middleware/authMiddleware.js";

import {
  createShortUrl,
  redirectToOriginalUrl,
  getUserUrls,
  deleteShortUrl,
  updateShortUrl,
} from "../controllers/urlController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import validateUrl from "../middleware/validateUrl.js";

const router = express.Router();

router.post(
  "/shorten",
  optionalAuthMiddleware,
  validateUrl,
  createShortUrl
);

router.get(
  "/history",
  authMiddleware,
  getUserUrls
);

router.put(
  "/:id",
  authMiddleware,
  validateUrl,
  updateShortUrl
);

router.delete(
  "/:id",
  authMiddleware,
  deleteShortUrl
);

router.get(
  "/:shortCode",
  redirectToOriginalUrl
);

export default router;
