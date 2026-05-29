import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../config/jwt.js";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 8 * 60 * 60 * 1000,
});

const sendAuthCookie = (res, userId) => {
  const token = generateToken(userId.toString());
  res.cookie("token", token, getCookieOptions());
};

const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  fullName: user.fullName || "",
  jobTitle: user.jobTitle || "",
  company: user.company || "",
  location: user.location || "",
  website: user.website || "",
  phone: user.phone || "",
  bio: user.bio || "",
  settings: user.settings || {
    theme: "dark",
    notifications: { email: true },
    privacy: { publicProfile: false, shareAnalytics: false },
  },
  customDomains: user.customDomains || [],
  subscriptionType: user.subscriptionType || "free",
});

const normalizeEmail = (value) => value?.trim().toLowerCase();

export const signup = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    sendAuthCookie(res, user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Signup Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    sendAuthCookie(res, user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      ...getCookieOptions(),
      maxAge: undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user ? sanitizeUser(req.user) : null,
    });
  } catch (error) {
    console.error("GetMe Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const updates = {};
    const {
      username,
      email,
      currentPassword,
      newPassword,
      confirmPassword,
      fullName,
      jobTitle,
      company,
      location,
      website,
      phone,
      bio,
      theme,
      notifications,
      privacy,
      customDomains,
    } = req.body;

    const currentUser = await User.findById(req.user._id).select("+password");

    if (typeof username === "string") {
      const nextUsername = username.trim();

      if (nextUsername.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Username must be at least 3 characters",
        });
      }

      updates.username = nextUsername;
    }

    if (typeof email === "string") {
      const nextEmail = normalizeEmail(email);

      if (!nextEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      if (nextEmail !== currentUser.email) {
        const existingUser = await User.findOne({ email: nextEmail });

        if (existingUser && existingUser._id.toString() !== currentUser._id.toString()) {
          return res.status(409).json({
            success: false,
            message: "Email already exists",
          });
        }
      }

      updates.email = nextEmail;
    }

    const textFields = {
      fullName: { value: fullName, max: 80 },
      jobTitle: { value: jobTitle, max: 80 },
      company: { value: company, max: 100 },
      location: { value: location, max: 120 },
      website: { value: website, max: 200 },
      phone: { value: phone, max: 30 },
      bio: { value: bio, max: 500 },
    };

    for (const [field, config] of Object.entries(textFields)) {
      if (typeof config.value === "string") {
        const nextValue = config.value.trim();

        if (nextValue.length > config.max) {
          return res.status(400).json({
            success: false,
            message: `${field} must be ${config.max} characters or less`,
          });
        }

        updates[field] = nextValue;
      }
    }

    if (updates.website) {
      try {
        const websiteUrl = new URL(/^https?:\/\//i.test(updates.website) ? updates.website : `https://${updates.website}`);
        updates.website = websiteUrl.toString().replace(/\/$/, "");
      } catch {
        return res.status(400).json({
          success: false,
          message: "Website URL is invalid",
        });
      }
    }

    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password, new password, and confirmation are required",
        });
      }

      const isCurrentMatch = await bcrypt.compare(currentPassword, currentUser.password || "");

      if (!isCurrentMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "New password and confirmation do not match",
        });
      }

      updates.password = await bcrypt.hash(newPassword, 12);
    }

    if (theme && ["light", "dark"].includes(theme)) {
      updates["settings.theme"] = theme;
    }

    if (notifications && typeof notifications === "object") {
      if (typeof notifications.email === "boolean") {
        updates["settings.notifications.email"] = notifications.email;
      }
    }

    if (privacy && typeof privacy === "object") {
      if (typeof privacy.publicProfile === "boolean") {
        updates["settings.privacy.publicProfile"] = privacy.publicProfile;
      }

      if (typeof privacy.shareAnalytics === "boolean") {
        updates["settings.privacy.shareAnalytics"] = privacy.shareAnalytics;
      }
    }

    if (Array.isArray(customDomains)) {
      updates.customDomains = customDomains
        .map((domain) => String(domain || "").trim().toLowerCase())
        .filter(Boolean);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No profile changes provided",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error("UpdateProfile Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
