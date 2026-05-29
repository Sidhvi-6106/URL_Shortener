import mongoose from "mongoose";

const clickSchema = new mongoose.Schema(
  {
    ipAddress: String,
    country: String,
    city: String,
    device: String,
    browser: String,
    os: String,
    clickedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    shortUrl: {
      type: String,
      required: true,
    },
    customAlias: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    domain: {
      type: String,
      default: () => process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
    },
    qrCode: {
      type: String,
      default: "",
    },
    qrCodeUrl: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    expiryDate: {
      type: Date,
      default: null,
      index: true,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    passwordProtected: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: "",
      select: false,
    },
    totalClicks: {
      type: Number,
      default: 0,
    },
    clicks: [clickSchema],
  },
  {
    timestamps: true,
  }
);

const URL = mongoose.model("URL", urlSchema);

export default URL;
