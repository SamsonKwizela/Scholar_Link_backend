const mongoose = require("mongoose");

const scholarshipApplicationSchema = new mongoose.Schema(
  {
    scholarship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scholarship",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    motivationLetter: {
      type: String,
    },

    documents: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "ScholarshipApplication",
  scholarshipApplicationSchema,
);
