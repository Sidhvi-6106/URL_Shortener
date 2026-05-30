import bcrypt from "bcryptjs";
import os from "node:os";
import UrlModel from "../models/Url.js";
import User from "../models/User.js";
import generateCode from "../utils/generateCode.js";
import generateQRCode from "./qrService.js";

const isLocalhostUrl = (value) => {
  try {
    const url = new globalThis.URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
};

const getLanAddress = () => {
  const interfaces = os.networkInterfaces();

  for (const addresses of Object.values(interfaces)) {
    const address = addresses?.find(
      (item) => item.family === "IPv4" && !item.internal
    );

    if (address) {
      return address.address;
    }
  }

  return "";
};

const replaceLocalhostWithLan = (value) => {
  if (process.env.NODE_ENV === "production" || !isLocalhostUrl(value)) {
    return value;
  }

  const lanAddress = getLanAddress();

  if (!lanAddress) {
    return value;
  }

  const url = new globalThis.URL(value);
  url.hostname = lanAddress;

  return url.toString().replace(/\/$/, "");
};

export const getBaseUrl = () => {
  const configuredUrl =
    process.env.BASE_URL ||
    process.env.CLIENT_URL ||
    `http://localhost:${process.env.PORT || 5000}`;

  return replaceLocalhostWithLan(configuredUrl).replace(/\/$/, "");
};

export const buildShortUrl = (shortCode) => {
  return `${getBaseUrl()}/r/${shortCode}`;
};

export const normalizeExpiryDate = (expiryDate) => {
  if (!expiryDate) {
    return null;
  }

  if (expiryDate instanceof Date) {
    return expiryDate;
  }

  const value = typeof expiryDate === "string" ? expiryDate.trim() : expiryDate;

  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    const [year, month, day] = String(value).split("-").map(Number);

    return new Date(year, month - 1, day, 23, 59, 59, 999);
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

export const isExpiredDate = (expiryDate) => {
  if (!expiryDate) {
    return false;
  }

  return new Date() >= new Date(expiryDate);
};

const createUniqueShortCode = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const shortCode = generateCode();
    const existingUrl = await UrlModel.findOne({ shortCode });

    if (!existingUrl) {
      return shortCode;
    }
  }

  throw new Error("Could not generate a unique short code");
};

const createShortUrlService = async ({
  originalUrl,
  customAlias,
  expiryDate,
  passwordProtected,
  password,
  userId,
}) => {
  const shortCode = customAlias || (await createUniqueShortCode());

  if (customAlias) {
    const existingAlias = await UrlModel.findOne({
      $or: [{ customAlias }, { shortCode: customAlias }],
    });

    if (existingAlias) {
      const error = new Error("Custom alias already taken");
      error.statusCode = 409;
      throw error;
    }
  }

  const shortUrl = buildShortUrl(shortCode);
  const qrCode = await generateQRCode(shortUrl);
  const normalizedExpiryDate = normalizeExpiryDate(expiryDate);

  const payload = {
    originalUrl,
    shortCode,
    shortUrl,
    qrCode,
    qrCodeUrl: qrCode,
    domain: getBaseUrl(),
    createdBy: userId || null,
    expiryDate: normalizedExpiryDate,
    isExpired: isExpiredDate(normalizedExpiryDate),
    passwordProtected: Boolean(passwordProtected),
    password: "",
  };

  if (customAlias) {
    payload.customAlias = customAlias;
  }

  if (passwordProtected) {
    if (!password || password.length < 6) {
      const error = new Error("Password must be at least 6 characters");
      error.statusCode = 400;
      throw error;
    }

    payload.password = await bcrypt.hash(password, 12);
  }

  const urlDoc = await UrlModel.create(payload);

  if (userId) {
    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          recentUrls: {
            $each: [urlDoc._id],
            $position: 0,
            $slice: 10,
          },
        },
      },
      { new: true }
    );
  }

  return urlDoc;
};

export default createShortUrlService;
