const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    profilePicture: {
      type: String,
      default: null,
    },

    location: {
      type: String,
      default: null,
    },

    university: {
      type: String,
      default: null,
    },

    emailPreferences: {
      scholarshipNotifications: {
        type: Boolean,
        default: true,
      },
      internshipNotifications: {
        type: Boolean,
        default: true,
      },
      deadlineReminders: {
        type: Boolean,
        default: true,
      },
      applicationUpdates: {
        type: Boolean,
        default: true,
      },
      adminMessages: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);