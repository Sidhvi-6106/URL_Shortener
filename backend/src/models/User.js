import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },

    jobTitle: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },

    company: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    recentUrls: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "URL",
      },
    ],

    settings: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "dark",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
      },
      privacy: {
        publicProfile: {
          type: Boolean,
          default: false,
        },
        shareAnalytics: {
          type: Boolean,
          default: false,
        },
      },
    },

    customDomains: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    subscriptionType: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
