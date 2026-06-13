import bcrypt from "bcryptjs";
import URL from "../models/Url.js";
import User from "../models/User.js";
import generateAnalyticsData from "../services/analyticsService.js";
import generateQRCode from "../services/qrService.js";
import createShortUrlService, { buildShortUrl, getBaseUrl, isExpiredDate, normalizeExpiryDate } from "../services/shortenerService.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const renderPasswordPage = (shortCode, message = "") => {
  const escapedCode = escapeHtml(shortCode);
  const escapedMessage = escapeHtml(message);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Unlock Nano URL</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background: #09090f;
      color: #f8fafc;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .card {
      width: min(100%, 520px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 28px;
      background: rgba(15, 23, 42, 0.94);
      padding: 32px;
      box-shadow: 0 24px 80px -40px rgba(59, 130, 246, 0.45);
    }
    .eyebrow {
      margin: 0 0 12px;
      color: #38bdf8;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.28em;
      text-transform: uppercase;
    }
    h1 { margin: 0; font-size: 32px; line-height: 1.15; }
    p { color: #94a3b8; line-height: 1.6; }
    input {
      width: 100%;
      margin-top: 14px;
      border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.05);
      color: #f8fafc;
      padding: 14px 16px;
      font-size: 16px;
      outline: none;
    }
    input:focus { border-color: #38bdf8; }
    button {
      margin-top: 16px;
      border: 0;
      border-radius: 18px;
      background: #38bdf8;
      color: #06101f;
      padding: 12px 18px;
      font-weight: 800;
      cursor: pointer;
    }
    .error { color: #fb7185; }
  </style>
</head>
<body>
  <main class="card">
    <p class="eyebrow">Secure redirect</p>
    <h1>Unlock this link</h1>
    <p>This Nano URL is password protected. Enter the password to continue.</p>
    ${escapedMessage ? `<p class="error">${escapedMessage}</p>` : ""}
    <form method="get" action="">
      <input name="password" type="password" placeholder="Password" autocomplete="current-password" autofocus required />
      <button type="submit">Continue</button>
    </form>
    <p>Link code: ${escapedCode}</p>
  </main>
</body>
</html>`;
};

export const createShortUrl = async (req, res) => {
  try {
    const {
      originalUrl,
      customAlias,
      expiryDate,
      passwordProtected,
      password,
    } = req.body;
    const userId = req.user?._id || null;

    const urlDoc = await createShortUrlService({
      originalUrl,
      customAlias,
      expiryDate,
      passwordProtected,
      password,
      userId,
    });

    return res.status(201).json({
      success: true,
      message: "Short URL created",
      data: urlDoc,
    });
  } catch (error) {
    console.error("Create Short URL Error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create short URL",
    });
  }
};

export const updateShortUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      originalUrl,
      customAlias,
      expiryDate,
      passwordProtected,
      password,
    } = req.body;

    const urlDoc = await URL.findOne({
      _id: id,
      createdBy: req.user._id,
    }).select("+password");

    if (!urlDoc) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    if (customAlias && customAlias !== urlDoc.customAlias) {
      const existingAlias = await URL.findOne({
        $or: [{ customAlias }, { shortCode: customAlias }],
      });

      if (existingAlias) {
        return res.status(409).json({
          success: false,
          message: "Custom alias already taken",
        });
      }

      urlDoc.customAlias = customAlias;
      urlDoc.shortCode = customAlias;
      urlDoc.shortUrl = buildShortUrl(customAlias);
      urlDoc.domain = getBaseUrl();
      urlDoc.qrCode = await generateQRCode(urlDoc.shortUrl);
      urlDoc.qrCodeUrl = urlDoc.qrCode;
    }

    if (originalUrl) {
      urlDoc.originalUrl = originalUrl;
    }

    if (expiryDate === "" || expiryDate === null) {
      urlDoc.expiryDate = null;
      urlDoc.isExpired = false;
    } else if (expiryDate !== undefined) {
      const normalizedExpiryDate = normalizeExpiryDate(expiryDate);
      urlDoc.expiryDate = normalizedExpiryDate;
      urlDoc.isExpired = isExpiredDate(normalizedExpiryDate);
    }

    if (typeof passwordProtected === "boolean") {
      if (passwordProtected) {
        if (password) {
          if (password.length < 6) {
            return res.status(400).json({
              success: false,
              message: "Password must be at least 6 characters",
            });
          }

          urlDoc.password = await bcrypt.hash(password, 12);
        } else if (!urlDoc.passwordProtected || !urlDoc.password) {
          return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters",
          });
        }

        urlDoc.passwordProtected = true;
      } else {
        urlDoc.passwordProtected = false;
        urlDoc.password = "";
      }
    }

    await urlDoc.save();

    return res.status(200).json({
      success: true,
      message: "URL updated successfully",
      data: urlDoc,
    });
  } catch (error) {
    console.error("Update URL Error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update URL",
    });
  }
};

export const deleteShortUrl = async (req, res) => {
  try {
    const { id } = req.params;

    const urlDoc = await URL.findOneAndDelete({
      _id: id,
      createdBy: req.user._id,
    });

    if (!urlDoc) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { recentUrls: urlDoc._id },
    });

    return res.status(200).json({
      success: true,
      message: "URL deleted successfully",
    });
  } catch (error) {
    console.error("Delete URL Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete URL",
    });
  }
};

export const redirectToOriginalUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const urlDoc = await URL.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }],
    }).select("+password");

    if (!urlDoc) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    if (isExpiredDate(urlDoc.expiryDate)) {
      urlDoc.isExpired = true;
      await urlDoc.save();

      return res.status(410).json({
        success: false,
        message: "URL expired",
      });
    }

    if (urlDoc.passwordProtected) {
      const password = req.query.password;

      if (!password) {
        if (req.query.resolve === "1") {
          return res.status(200).json({
            success: true,
            requiresPassword: true,
          });
        }

        return res.status(200).send(renderPasswordPage(shortCode));
      }

      const isMatch = await bcrypt.compare(password, urlDoc.password);

      if (!isMatch) {
        if (req.query.resolve === "1") {
          return res.status(200).json({
            success: false,
            requiresPassword: true,
            message: "Invalid password",
          });
        }

        return res.status(401).send(renderPasswordPage(shortCode, "Invalid password. Please try again."));
      }
    }

    await URL.updateOne(
      { _id: urlDoc._id },
      {
        $inc: { totalClicks: 1 },
        $push: { clicks: generateAnalyticsData(req) },
      }
    );

    if (req.query.resolve === "1") {
      return res.status(200).json({
        success: true,
        targetUrl: urlDoc.originalUrl,
      });
    }

    return res.redirect(urlDoc.originalUrl);
  } catch (error) {
    console.error("Redirect Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Redirect failed",
    });
  }
};

export const getUserUrls = async (req, res) => {
  try {
    const urls = await URL.find({
      createdBy: req.user._id,
    })
      .select("-password -clicks.ipAddress -clicks.country -clicks.city -clicks.device -clicks.browser -clicks.os")
      .sort({ createdAt: -1 })
      .lean();

    const preparedUrls = await Promise.all(
      urls.map(async (url) => {
        const expectedShortUrl = buildShortUrl(url.shortCode);
        const needsShortUrlRefresh = url.shortUrl !== expectedShortUrl;
        const isExpired = url.expiryDate ? new Date() > new Date(url.expiryDate) : false;

        if (needsShortUrlRefresh || url.isExpired !== isExpired) {
          const qrCode = needsShortUrlRefresh ? await generateQRCode(expectedShortUrl) : url.qrCode;

          await URL.updateOne(
            { _id: url._id },
            {
              $set: {
                shortUrl: expectedShortUrl,
                domain: getBaseUrl(),
                qrCode,
                qrCodeUrl: qrCode,
                isExpired,
              },
            }
          );

          return {
            ...url,
            shortUrl: expectedShortUrl,
            domain: getBaseUrl(),
            qrCode,
            qrCodeUrl: qrCode,
            isExpired,
          };
        }

        return {
          ...url,
          isExpired,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: preparedUrls,
    });
  } catch (error) {
    console.error("Get User URLs Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch URLs",
    });
  }
};
