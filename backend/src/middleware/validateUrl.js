const normalizeUrl = (value) => {
  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported");
  }

  return parsed.toString();
};

const validateUrl = (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiryDate } = req.body;

    if (!originalUrl?.trim()) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    req.body.originalUrl = normalizeUrl(originalUrl);

    if (customAlias && !/^[a-zA-Z0-9_-]{3,32}$/.test(customAlias)) {
      return res.status(400).json({
        success: false,
        message: "Custom alias must be 3-32 letters, numbers, dashes, or underscores",
      });
    }

    if (expiryDate && Number.isNaN(new Date(expiryDate).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Expiry date is invalid",
      });
    }

    return next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Invalid URL",
    });
  }
};

export default validateUrl;
